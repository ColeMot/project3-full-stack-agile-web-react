const express = require("express");
const DB = require("./db");
const cors = require("cors");
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const readDataRouter = require("./routes/read");
app.use("/read", readDataRouter);

const orderRouter = require("./routes/order");
app.use("/order", orderRouter);

const IngredientRouter = require("./routes/manageingredients");
app.use("/manageingredients", IngredientRouter);

const MenuRouter = require("./routes/managemenu");
app.use("/managemenu", MenuRouter);

const SeasonalRouter = require("./routes/manageseasonal");
app.use("/manageseasonal", SeasonalRouter);

const OrderRouter = require("./routes/manageorder");
app.use("/manageorder", OrderRouter);

const itemsRouter = require("./routes/customer_items");
app.use("/customer_items", itemsRouter);

const itemName_itemId_Router = require("./routes/itemNames_to_itemIds");
app.use("/itemNames_to_itemIds", itemName_itemId_Router);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

process.on("SIGINT", function () {
  DB.end();
  console.log("Application successfully shutdown");
  process.exit(0);
});
