// function createAccessToken(payload) {
//   // Create Token
//   return new Promise((resolve, reject) => {
//     jwt.sign(
//       payload,
//       "secret123",
//       {
//         expiresIn: "1d",
//       },
//       (err, token) => {
//         if (err) reject(err);
//         resolve(token);
//       }
//     );
//   });
// }

function generateAccessToken(idUser) {
  return jwt.sign(idUser, process.env.TOKEN_SECRET, { expiresIn: "1800s" });
}
