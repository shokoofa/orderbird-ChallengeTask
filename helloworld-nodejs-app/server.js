// importing express framework
    const express = require("express");

    const app = express();

    // Respond with "hello world" for requests that hit our root "/"
    app.get("/", function (req, res) {
     return res.send("Hello World");
    });

    // listen to port 8080 by default
    app.listen(process.env.PORT || 8080, () => {
      console.log("Server is running");
    });
