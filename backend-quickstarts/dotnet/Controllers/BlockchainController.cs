using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Openfort.SDK;
using Openfort.SDK.Model;

namespace server.Controllers
{
    public class BlockchainController : Controller
    {
        public readonly IOptions<OpenfortOptions> options;
        private readonly OpenfortClient client;
        private readonly string policyId = "pol_921245a6-9151-452a-aa72-2909d13ac404";
        private readonly int chainId = 80001;


        public BlockchainController(IOptions<OpenfortOptions> options)
        {
            this.options = options;
            client = new OpenfortClient(this.options.Value.SecretKey);
        }

        [HttpPost("create-transaction")]
        public async Task<IActionResult> CreateTransaction()
        {
            CreatePlayerRequest playerRequest = new CreatePlayerRequest
            (
                name: "John Doe"
            );
            PlayerResponse player = await client.Players.Create(playerRequest);

            Interaction interactionMint = new Interaction
                (
                    contract: Request.Form["contractId"],
                    functionName: "mint",
                    functionArgs: new List<object> { player.Id }
                );

            CreateTransactionIntentRequest transactionIntentRequest = new CreateTransactionIntentRequest
            (
                player: player.Id,
                chainId: chainId,
                policy: policyId,
                externalOwnerAddress: null!,
                optimistic: true,
                confirmationBlocks: 0,
                interactions: new List<Interaction> { interactionMint }
            );

            TransactionIntentResponse transactionIntent = await client.TransactionIntents.Create(transactionIntentRequest);
            return Ok(transactionIntent);
        }

        [HttpPost("request-transfer-ownership")]
        public async Task<IActionResult> RequestTransferOwnership()
        {

            PlayerTransferAccountOwnershipRequest requestTransferOwnership = new PlayerTransferAccountOwnershipRequest
            (
                playerId: Request.Form["playerId"],
                chainId: chainId,
                policy: policyId,
                newOwnerAddress: Request.Form["newOwnerAddress"]
            );

            TransactionIntentResponse transferRequest = await client.Players.RequestTransferAccountOwnership(requestTransferOwnership);

            return Ok(transferRequest);
        }

        [HttpGet("player-transactions")]
        public async Task<IActionResult> PlayerTransactions()
        {
            PlayerGetRequest playerGetRequest = new PlayerGetRequest
            (
                id: Request.Query["playerId"],
                expand: new List<PlayerResponseExpandable> { PlayerResponseExpandable.TransactionIntents }
            );
            PlayerResponse player = await client.Players.Get(playerGetRequest);

            return Ok(player);
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> Webhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            WebHookEvent openfortEvent;
            try
            {
                openfortEvent = client.ConstructWebhookEvent(
                    json,
                    Request.Headers["openfort-Signature"]
                );
                Console.WriteLine($"Webhook notification: {openfortEvent} found");
            }
            catch (Exception e)
            {
                Console.WriteLine($"Something failed {e}");
                return BadRequest();
            }


            var transactionIntent = openfortEvent.Data;
            Console.WriteLine($"Session ID: {transactionIntent.Id} for https://mumbai.polygonscan.com/tx/{transactionIntent.Response.TransactionHash}");
            // Take some action based on session.

            return Ok();
        }
    }
}
