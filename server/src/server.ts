import app from "./app";

const PORT: number = Number(process.env.EXPRESS_SERVER_PORT) || 8000;

app.listen(PORT, ():void => {
    console.log(`Express listening on port: ${PORT}.`);
})