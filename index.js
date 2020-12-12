const createApp = require("./createApp");

const port = 4000;

createApp().then((app) => {
  app.listen(process.env.PORT || port, () => {
    console.log(`my server is running on port http://localhost:${port}`);
  });
});
