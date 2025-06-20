import { useEffect } from "react";

const Chatbot = () => {
  useEffect(() => {
    const scriptId = "dialogflow-script";
    const widgetId = "dialogflow-widget";

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.src = "https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1";
      script.async = true;
      script.id = scriptId;
      document.body.appendChild(script);
    }

    if (!document.getElementById(widgetId)) {
      const dfMessenger = document.createElement("df-messenger");
      dfMessenger.setAttribute("intent", "WELCOME");
      dfMessenger.setAttribute("chat-title", "XPhone_DATN");
      dfMessenger.setAttribute("agent-id", "e54261ee-cd73-4400-866f-75904d6f8e53");
      dfMessenger.setAttribute("language-code", "vi");
      dfMessenger.id = widgetId;
      document.body.appendChild(dfMessenger);
    }
  }, []);

  return null;
};

export default Chatbot;
