export default function livereload() {
  const ws = new WebSocket("ws://localhost:10808/");
  ws.onmessage = (e) => {
    if (e.data === "RELOAD") {
      location.reload();
    }
  };
  ws.onclose = () => {
    setTimeout(livereload, 5000);
  };
}
