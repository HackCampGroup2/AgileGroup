let position = 0; // current wrapper index
const player = document.querySelector(".player-container");
const wrappers = document.querySelectorAll("#board .circle-wrapper");

function movePlayerTo(index) {
const target = wrappers[index];
const rectBoard = document.getElementById("board").getBoundingClientRect();
const rectTarget = target.getBoundingClientRect();

const offsetX = rectTarget.left - rectBoard.left;

player.style.position = "absolute";
player.style.left = offsetX + "px";
player.style.top = "-60px";
}

document.getElementById("ageButton").addEventListener("click", () => {
if (position < wrappers.length - 1) {
position++;
movePlayerTo(position);
}
});
