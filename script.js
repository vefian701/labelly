const cursor = document.querySelector(".cursor");
const left = document.querySelector(".left");

document.addEventListener("mousemove", e => {
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";

  const x = (e.clientX / window.innerWidth - 0.5) * 10;
  const y = (e.clientY / window.innerHeight - 0.5) * 10;
  left.style.transform = `translate(${x}px, ${y}px)`;
});

function analyze() {

  const protein = +document.getElementById("protein").value;
  const fiber = +document.getElementById("fiber").value;
  const sugar = +document.getElementById("sugar").value;
  const addedSugar = +document.getElementById("addedSugar").value;
  const sodium = +document.getElementById("sodium").value;
  const fat = +document.getElementById("fat").value;

  let good = [];
  let watch = [];
  let tips = [];

  if (protein >= 8) good.push(`Good protein (${protein}g) → supports muscle recovery & keeps you full.`);
  else if (protein >= 5) {
    good.push(`Moderate protein (${protein}g).`);
    watch.push(`Protein slightly low for a full meal.`);
    tips.push(`Add eggs, paneer, curd, tofu, dal or chicken.`);
  } else {
    watch.push(`Low protein (${protein}g) → poor satiety & muscle support.`);
    tips.push(`Add strong protein like eggs, paneer, curd, tofu, dal or chicken.`);
  }

  if (fiber >= 5) good.push(`High fiber (${fiber}g) → excellent digestion & gut health.`);
  else if (fiber >= 3) good.push(`Decent fiber (${fiber}g).`);
  else {
    watch.push(`Low fiber (${fiber}g) → poor digestion.`);
    tips.push(`Add fruits, vegetables, oats, seeds or whole grains.`);
  }

  if (addedSugar > 5) {
    watch.push(`High added sugar (${addedSugar}g) → energy crashes & cravings.`);
    tips.push(`Pair with nuts, seeds & fiber to slow sugar absorption.`);
  } else if (sugar > 10) {
    watch.push(`Moderate sugar (${sugar}g) → blood sugar spikes.`);
    tips.push(`Combine with fiber & protein.`);
  } else {
    good.push(`Low sugar (${sugar}g).`);
  }

  if (sodium > 600) {
    watch.push(`Very high sodium (${sodium}mg) → bloating & water retention.`);
    tips.push(`Balance with banana, coconut water, curd & lemon water.`);
  } else if (sodium > 300) {
    watch.push(`Moderate sodium (${sodium}mg).`);
    tips.push(`Drink extra water.`);
  } else {
    good.push(`Low sodium (${sodium}mg).`);
  }

  if (fat > 15 && protein < 5) {
    watch.push(`High fat with low protein → poor nutrition balance.`);
    tips.push(`Add lean protein & fiber-rich foods.`);
  }

  if (watch.length === 0) watch.push("No major nutritional red flags found.");

  let verdict = "good everyday food";
  if (protein < 5 || sodium > 600 || addedSugar > 5) verdict = "okay occasionally";
  if (watch.length >= 4) verdict = "limit consumption";

  document.getElementById("verdict").innerText = verdict;
  document.getElementById("goodList").innerHTML = good.map(i => `<li>${i}</li>`).join("");
  document.getElementById("warnList").innerHTML = watch.map(i => `<li>${i}</li>`).join("");
  document.getElementById("meaning").innerText = `Overall, this food is ${verdict}.`;
  document.getElementById("tip").innerText = tips.length ? tips.join(" ") : "This food is nutritionally balanced.";

  document.getElementById("page1").classList.remove("active");
  document.getElementById("page2").classList.add("active");
}

function goBack() {
  document.getElementById("page2").classList.remove("active");
  document.getElementById("page1").classList.add("active");
}

function downloadCard() {
  html2canvas(document.getElementById("resultCard"), {
    scale: 3,
    backgroundColor: "#ffffff"
  }).then(canvas => {
    const link = document.createElement("a");
    link.download = "nutrition-analysis.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}

/* ---------- BARCODE SCANNER ---------- */

let scanner;

function openScanner() {
  document.getElementById("scannerModal").classList.add("active");

  scanner = new Html5Qrcode("reader");

  scanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    onScanSuccess
  );
}

function closeScanner() {
  document.getElementById("scannerModal").classList.remove("active");
  if (scanner) scanner.stop();
}

function onScanSuccess(code) {
  closeScanner();
  fetchFoodData(code);
}

async function fetchFoodData(barcode) {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );
    const data = await res.json();

    if (!data.product) return alert("Product not found 😢");

    const n = data.product.nutriments;

    document.getElementById("calories").value = n["energy-kcal_100g"] || "";
    document.getElementById("protein").value = n.proteins_100g || "";
    document.getElementById("carbs").value = n.carbohydrates_100g || "";
    document.getElementById("sugar").value = n.sugars_100g || "";
    document.getElementById("addedSugar").value = n["added-sugars_100g"] || "";
    document.getElementById("fat").value = n.fat_100g || "";
    document.getElementById("fiber").value = n.fiber_100g || "";
    document.getElementById("sodium").value = (n.sodium_100g || 0) * 1000;

  } catch {
    alert("Scan failed. Try manual input.");
  }
}