import express, {Router} from "express";
import passport from "passport";
import passportLocal from "passport-local";
import passportGoogle from "passport-google-oauth20";
import passportJwt from "passport-jwt";
import bcrypt from "bcrypt";
import {PrismaClient, User} from "@prisma/client";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Openfort, {Interaction} from "@openfort/openfort-node";

const db = new PrismaClient();
const LocalStrategy = passportLocal.Strategy;
const GoogleStrategy = passportGoogle.Strategy;
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
const router: Router = express.Router();
const jwt_secret = process.env.JWT_SECRET!;
const openfort = new Openfort(process.env.OPENFORT_SECRET_KEY!);

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.ECOSYSTEM_BACKEND_URL + "/auth/google/callback",
        },
        async function (accessToken, refreshToken, profile, cb) {
            let user: User | null;
            try {
                user = await db.user.findUnique({
                    where: {email: profile.emails![0].value as string},
                });
                if (user && user.password) {
                    return cb(undefined, false, {
                        message: `Player signed up with email and password.`,
                    });
                }
                let playerOf;
                if (!user) {
                    playerOf = await openfort.players.create({
                        name: profile.emails![0].value as string,
                    });
                    playerOf = playerOf.id;
                } else {
                    playerOf = user.playerOf;
                }

                user = await db.user.upsert({
                    where: {
                        googleId: profile.id,
                    },
                    update: {},
                    create: {
                        email: profile.emails![0].value as string,
                        googleId: profile.id,
                        googleRefreshToken: refreshToken,
                        playerOf: playerOf,
                    },
                });

                return cb(null, user);
            } catch (err: any) {
                console.error(err);
                return cb(err);
            }
        },
    ),
);

passport.use(
    new LocalStrategy({usernameField: "email"}, async (email, password, done) => {
        let user: User | null;
        try {
            user = await db.user.findUnique({
                where: {email: email.toLowerCase()},
            });
        } catch (err) {
            return done(err);
        }

        if (!user) {
            return done(undefined, false, {message: `Email ${email} not found.`});
        }

        // Compare the provided password with the stored hashed password
        if (!user.password)
            return done(undefined, false, {
                message: `No password found for user ${user.id}.`,
            });
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return done(undefined, false, {
                message: "Invalid email or password.",
            });
        }

        // If the passwords match, return the user
        return done(undefined, user);
    }),
);

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

passport.use(
    new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
        let user: User | null;
        try {
            user = await db.user.findUnique({where: {id: jwtPayload.userId}});
        } catch (err) {
            return done(err);
        }

        if (!user) {
            return done(undefined, false);
        }

        done(undefined, user);
    }),
);

/* Configure session management.
 *
 * When a login session is established, information about the user will be
 * stored in the session.  This information is supplied by the `serializeUser`
 * function, which is yielding the user ID and username.
 *
 * As the user interacts with the app, subsequent requests will be authenticated
 * by verifying the session.  The same user information that was serialized at
 * session establishment will be restored when the session is authenticated by
 * the `deserializeUser` function.
 *
 * Since every request to the app needs the user ID and username, in order to
 * fetch todo records and render the user element in the navigation bar, that
 * information is stored in the session.
 */
passport.serializeUser((user: any, done) => {
    process.nextTick(() => {
        done(null, {id: user.id, email: user.email});
    });
});

passport.deserializeUser((user: any, done) => {
    process.nextTick(() => {
        done(null, user);
    });
});

/* POST /signup
 *
 * This route creates a new user account.
 *
 * A desired username and password are submitted to this route via an HTML form,
 * which was rendered by the `GET /signup` route.  The password is hashed and
 * then a new user record is inserted into the database.  If the record is
 * successfully created, the user is logged in.
 */
router.post("/signup", async (req, res) => {
    const {email, password, game} = req.body;

    if (!email || !password || !game) {
        return res.status(400).json({message: "Email, password and game are required."});
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({where: {email}});
    if (existingUser) {
        return res.status(400).json({message: "Email is already in use."});
    }

    // Hash the password - you might want to validate the password first
    const hashedPassword = await bcrypt.hash(password, 10);
    // Generate a refresh token
    const refreshToken = crypto.randomBytes(32).toString("hex");
    // Create a new user

    const playerOf = await openfort.players.create({name: email});

    const user = await db.user.create({
        data: {email, password: hashedPassword, refreshToken: refreshToken, playerOf: playerOf.id},
    });

    await db.userGame.create({
        data: {
            user: {
                connect: {
                    id: user.id,
                },
            },
            game: {
                connect: {
                    id: Number(game),
                },
            },
        },
    });

    // Create a JWT
    const token = jwt.sign({userId: user.id}, jwt_secret, {
        expiresIn: "1h",
    });

    res.json({player: user.id, token});
});

router.post("/signin", passport.authenticate("local", {session: false}), async (req, res) => {
    const user = req.user as User;
    const token = jwt.sign({userId: user.id}, jwt_secret, {
        expiresIn: "1h",
    });

    // Generate a refresh token
    const refreshToken = crypto.randomBytes(32).toString("hex");

    // Store the refresh token in the database
    await db.user.update({
        where: {id: user.id},
        data: {refreshToken: refreshToken},
    });

    res.json({player: user.id, token});
});

router.post("/token", async (req, res) => {
    const {refreshToken} = req.body;

    if (!refreshToken) {
        return res.status(400).json({message: "Refresh token is required."});
    }

    // Find the user with the refresh token
    const user = await db.user.findUnique({where: {refreshToken}});

    if (!user) {
        return res.status(400).json({message: "Invalid refresh token."});
    }

    // If the refresh token is valid, create a new token for the user
    const token = jwt.sign({userId: user.id}, jwt_secret, {
        expiresIn: "1h",
    });

    res.json({token});
});

router.get("/google/callback", function (req, res, next) {
    passport.authenticate("google", async function (err: any, user: User) {
        if (err) {
            console.error(err);
            return next(err);
        }
        if (!user) {
            console.log("No user found");
            return res.redirect(`${process.env.ECOSYSTEM_FRONTEND_URL}/auth`);
        }
        let receivedData = JSON.parse(Buffer.from(req.query.state as string, "base64").toString());

        if (!receivedData["game"]) {
            return res.status(400).json({message: "Game is required."});
        }

        await db.userGame.upsert({
            where: {
                userId_gameId: {
                    userId: user.id,
                    gameId: Number(receivedData["game"]),
                },
            },
            update: {},
            create: {
                user: {
                    connect: {
                        id: user.id,
                    },
                },
                game: {
                    connect: {
                        id: Number(receivedData["game"]),
                    },
                },
            },
        });

        const token = jwt.sign({userId: user.id}, jwt_secret, {
            expiresIn: "1h",
        });

        // Generate a refresh token
        const refreshToken = crypto.randomBytes(32).toString("hex");

        // Store the refresh token in the database
        await db.user.update({
            where: {id: user.id},
            data: {refreshToken: refreshToken},
        });

        if (receivedData["redirect_uri"]) {
            res.redirect(
                `${process.env.ECOSYSTEM_FRONTEND_URL}/auth/?token=${token}&redirect_uri=${receivedData["redirect_uri"]}&game=${receivedData["game"]}`,
            );
        } else {
            res.redirect(`${process.env.ECOSYSTEM_FRONTEND_URL}/auth/?token=${token}`);
        }
    })(req, res, next);
});

router.get("/profile", passport.authenticate("jwt", {session: false}), (req, res) => {
    res.json(req.user);
});

router.post("/mint", passport.authenticate("jwt", {session: false}), async (req, res) => {
    const playerId = (req.user as User).playerOf!;
    const policy_id = "pol_182c7c1f-1e8d-4363-8b66-532f57b2e56e";
    const contract_id = "con_542f32a1-f895-447b-b9cd-e7a109671b0f";
    const chainId = 80001;
    const optimistic = true;

    const interaction_mint: Interaction = {
        contract: contract_id,
        functionName: "mint",
        functionArgs: [playerId],
    };

    const transactionIntent = await openfort.transactionIntents.create({
        player: playerId,
        chainId: chainId,
        optimistic,
        interactions: [interaction_mint],
        policy: policy_id,
    });

    return res.send({
        data: transactionIntent,
    });
});

router.get("/inventory", passport.authenticate("jwt", {session: false}), async (req, res) => {
    const playerId = (req.user as User).playerOf!;
    const chainId = 80001;
    let playerInventory;
    try {
        playerInventory = await openfort.players.getInventory({id: playerId, chainId});
    } catch (error) {
        console.log(error);
    }

    return res.send({
        data: playerInventory,
    });
});

export default router;
