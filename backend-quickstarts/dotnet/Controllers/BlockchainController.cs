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
        private readonly int chainId = 43113;

        private readonly Dictionary<string, (string contractId, string policyId)> contractPolicyMap = new Dictionary<string, (string contractId, string policyId)>
        {
            { "1", ("con_6b46eb3d-70c4-4b00-b94c-6628a6f6920c", "pol_9caa6b7a-1cc1-4ee0-b5f6-7d465c97f767") },
            { "2", ("con_6b46eb3d-70c4-4b00-b94c-6628a6f6920c", "pol_9f71a00d-e13c-418a-a9a0-79288833a0a0") },
            { "3", ("con_6b46eb3d-70c4-4b00-b94c-6628a6f6920c", "pol_20cc4d56-ef4f-4b6d-a4f8-649b4149e5cd") }

        };

        public BlockchainController(IOptions<OpenfortOptions> options)
        {
            this.options = options;
            client = new OpenfortClient(this.options.Value.SecretKey);
        }

        [HttpGet("/")]
        public IActionResult GetRoot()
        {
            return Ok("Service is running");
        }

        [HttpPost("wallet")]
        public async Task<IActionResult> CreateWallet()
        {
            CreatePlayerRequest playerRequest = new CreatePlayerRequest
            (
                name: "John Doe"
            );
            PlayerResponse player = await client.Players.Create(playerRequest);
            return Ok(player);
        }

        [HttpPost("purchase")]
        public async Task<IActionResult> CreateTransaction()
        {
            string itemKey = Request.Form["item"];
            string playerId = Request.Form["playerId"];

            if (!contractPolicyMap.TryGetValue(itemKey, out var mapping))
            {
                return BadRequest($"No mapping found for {itemKey}");
            }

            Interaction interactionMint = new Interaction
                (
                    contract: mapping.contractId.ToString(),
                    functionName: "mint",
                    functionArgs: new List<object> { playerId }
                );

            CreateTransactionIntentRequest transactionIntentRequest = new CreateTransactionIntentRequest
            (
                player: playerId,
                chainId: chainId,
                policy: mapping.policyId.ToString(),
                externalOwnerAddress: null!,
                optimistic: true,
                confirmationBlocks: 3,
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
                policy: "policyId",
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
                    Request.Headers["openfort-signature"]
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
