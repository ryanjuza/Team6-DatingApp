const app = require("../app");
const supertest = require("supertest");
const request = supertest(app);


describe("/test endpoint", () => {
    it("should return a response", async () => {
        const response = await request.get("/test")
        expect(response.status).toBe(200)
        expect(response.text).toBe("Hello world");

    })
})


// describe("POST /", function() {
//  it("redirects user to male section if user is male", function(done) {

//  request(app).post("/logins").send({username: "rez@e.com", password: "123"}).expect('Location', '/male').end(done);


//  });

// //  it("redirects user to female section if user is female", function(done) {

// //     request(app).post("/home").send({username: "em@e.com", password: "123"}).expect('Location', '/female').end(done);
   
   
// //     });
// });