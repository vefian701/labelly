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

  if (protein >= 8) good.push(`Good protein (${protein}g).`);
  else if (protein >= 5) good.push(`Moderate protein (${protein}g).`);
  else watch.push(`Low protein (${protein}g).`);

  if (fiber >= 5) good.push(`High fiber (${fiber}g).`);
  else if (fiber >= 3) good.push(`Decent fiber (${fiber}g).`);
  else watch.push(`Low fiber (${fiber}g).`);

  if (addedSugar > 5) watch.push(`High added sugar (${addedSugar}g).`);
  else if (sugar > 10) watch.push(`Moderate sugar (${sugar}g).`);
  else good.push(`Low sugar (${sugar}g).`);

  if (sodium > 600) watch.push(`Very high sodium (${sodium}mg).`);
  else if (sodium > 300) watch.push(`Moderate sodium (${sodium}mg).`);
  else good.push(`Low sodium (${sodium}mg).`);

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

/* ---------- BARCODE SCANNER ---------- */

let scanner;

function openScanner() {
  document.getElementById("scannerModal").classList.add("active");

  scanner = new Html5Qrcode("reader");

  scanner.start(
    { facingMode: { exact: "environment" } },
    {
      fps: 15,
      qrbox: { width: 240, height: 140 },
      aspectRatio: 1.777,
      disableFlip: true
    },
    onScanSuccess,
    err => {}
  );
}

function closeScanner() {
  document.getElementById("scannerModal").classList.remove("active");
  if (scanner) scanner.stop().catch(() => {});
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
