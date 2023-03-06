const express = require("express");

const { setWebhook, getMe } = require("./src/telegram");
const { parseRequest, handleCallbacks } = require("./src/centralLogic");
const { loadProcedures } = require("./models/procedures");

const app = express();

var procedures = [];
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/setWebHook', setWebhook);

app.get('/bot', getMe);

app.post("/", async (req, res) => {
  if (req.body.callback_query) {
    await handleCallbacks(req.body);
  }
  else {
    await parseRequest(req.body);
  }
  return res.send("OK");
});


async function startProcess() {
  procedures = await loadProcedures();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startProcess();
