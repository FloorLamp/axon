import { axon } from "../../declarations/axon";

document.getElementById("clickMeBtn").addEventListener("click", async () => {
  const name = document.getElementById("name").value.toString();
  // Interact with axon actor, calling the greet method
  const greeting = await axon.greet(name);

  document.getElementById("greeting").innerText = greeting;
});
