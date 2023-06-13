import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";

import authRouter from "./routes/auth";

const app: Application = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", authRouter);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  const err: any = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
