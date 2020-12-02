const request = require("supertest");
const mongoose = require("mongoose");
const createApp = require("../createApp");

let app;

beforeAll(async (done) => {
  app = await createApp();

  done();
});

afterAll(async (done) => {
  await mongoose.connection.close();
  done();
});

const testImage = `${__dirname}/tweety.jpg`;

describe("Image Api", () => {
  it("Can upload an image", function (done) {
    request(app)
      .post("/image")
      .set("Accept", "application/json")
      .attach("image", testImage, { contentType: "form/multipart" })
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        console.log(res.body);
        done();
      });
  });
});
