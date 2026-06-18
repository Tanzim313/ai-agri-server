const predictDisease =
require("./src/ai/disease/diseasePredictor");

(async () => {

  try {

    const result =
      await predictDisease("./test.jpg");

    console.log(result);

  } catch (error) {

    console.error(error);

  }

})();