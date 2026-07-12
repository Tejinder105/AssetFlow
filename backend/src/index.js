import connectDB from "./db/index.js";
import env from "./config/env.config.js";
import { app } from "./app.js";

connectDB()
    .then(() => {
        app.listen(env.PORT, () => {
            console.log(`Server is running at port: ${env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("MySQL connection failed!", err);
    });
