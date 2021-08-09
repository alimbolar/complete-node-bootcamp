const fs = require("fs");
const superagent = require("superagent");

const readFilePro = function (file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, "utf-8", (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

const writeFilePro = function (file, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) reject(err);
      resolve("success");
    });
  });
};

const getDogPic = async function () {
  try {
    const data = await readFilePro(`${__dirname}/dog.txt`);
    // console.log(data);

    const res = await superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );

    // console.log(res.body.message);
    await writeFilePro(`${__dirname}/new-dog-image.txt`, res.body.message);

    // console.log("Dog Image Saved!");
  } catch (err) {
    console.log(err.message);
    throw err;
  }

  return "Step 2";
};

(async () => {
  try {
    console.log("Step 1");
    const x = await getDogPic();
    console.log(x);
    console.log("Step 3");
  } catch (err) {
    console.log("Error 😝😝😂😃😄😛🌶 ");
  }
})();

/*
console.log("Step 1");
getDogPic().then((x) => {
  console.log(x);
  console.log("Step 3");
});

*/

// readFilePro(`${__dirname}/dog.txt`)
//   .then((data) => {
//     console.log(data);
//     return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
//   })

//   .then((res) => {
//     console.log(res.body.message);
//     return writeFilePro("dog-image.txt", res.body.message);
//   })
//   .then(() => {
//     console.log("file updated!");
//   })
//   .catch((err) => {
//     console.log(err.message);
//   });
