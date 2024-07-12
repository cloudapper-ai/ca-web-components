# CloudApper AI Public Chatbox

CloudApper AI Public Chat-box is an advanced chatbot platform powered by artificial intelligence. It allows businesses to provide automated customer support and engage with their audience in a conversational manner.

With CloudApper AI Public Chat-box, businesses can easily integrate the chatbot into their website or application, enabling customers to interact with the chatbot to get instant responses to their queries. The chatbot is designed to understand natural language and provide accurate and helpful information to users.

# Customise Your Chat Box Element

```html

<body>
	<!--
		This is the custom element to show CloudApper AI chat-box.
	-->
	<chat-container
	        id="chatContainer"
	        title="Talk to AI"
	        username="Participant"
	        botname="AI Assistant"
		bubbletext="Hi, I am here to help."
		bubbledelay="5"
		identifier="-- request your own identifier from cloudapper ai team --"
	    ></chat-container>
	<!--
		Add this line inside the body tag after putting chat-container element.
	-->
	<script src="https://cdn.jsdelivr.net/gh/cloudapperinc/ca-web-components@1.0.12/dist/ca-chat-container.min.js"></script>

	<script>
		const chatContainer = document.getElementById('chatContainer')

	        function loadChatProperties() {
	            chatContainer.chatprimarycolor = '#1e4b80';
	            chatContainer.chatonprimarycolor = 'white';
	            chatContainer.welcomemessages = [
	                "Hi, I am an AI. I am powered by CloudApper AI. How can I help you today?"
	            ];
	
	            chatContainer.bubblestyle = 1;
	            chatContainer.cancelontouchoutside = true;
	            chatContainer.addgloweffect = true;
	            chatContainer.bubbletext = 'Hi, I am here to answer your questions.';
	        }
	
	        loadChatProperties();
	</script>
</body>
```

There are many attributes for the CloudApper AI Chatbox. Bellow is the description of each of this attributes:

- ***identifier***
    
    The chat box feature is an on-demand component and is not included by default with your CloudApper AI subscription. To enable this feature, please reach out to our support team with your specific requirements. Upon contact, we will provide you with a unique identifier that you can use as an input for our chat box element. This identifier essentially grants you a dedicated space where you can train your models and integrate them into your public websites. Additionally, the identifier acts as a protective measure, ensuring that your AI chat box subscription is exclusively used for your purposes and preventing unauthorised access.
    
- ***instanceurl***
    
    The **`instanceurl`** attribute represents the API container URL where your CloudApper AI Bot API is hosted. This URL serves as the connection point for accessing and interacting with your AI Bot API. Ensure that you use the correct **`instanceurl`** value to establish a seamless connection to your CloudApper AI Bot API.
    
- ***title***
    
    The **`title`** attribute allows you to customize the title displayed at the top when the chatbox is opened. You have the freedom to configure this title according to your preferences and requirements. Default value is: `CloudApper AI`
    
- ***chatprimarycolor***
    
    The **`chatprimarycolor`** attribute serves as the means to define the colour of the title bar. By configuring this attribute, you can set the specific colour you desire for the title bar within the chat box. Currently we don’t support assigning white colour as primary colour.
    
- ***chatonprimarycolor***
    
    The **`chatonprimarycolor`** attribute allows you to establish the text colour for the title bar. Utilise this attribute to define the precise text colour you wish to apply to the title bar text within the chat box.
    
- ***botname***
    
    The **`botname`** attribute provides you with the ability to personalise the name of the bot, which will be displayed alongside each bot response. By default, the value is set to `AI Assistant`. You can customise this attribute to reflect the desired bot name for a more tailored user experience.
    
- ***username***
    
    The **`username`** attribute corresponds to the name of the user engaging in a chat with the bot. The default value for this attribute is set as "user123." You can modify the **`username`** attribute to specify the user's name as per your requirements and preferences.
    
- ***cancelontouchoutside***
    
    To enable the functionality where the chat box window closes upon a user's click outside of the chat box, you should set the **`cancelontouchoutside`** attribute to "true." This configuration ensures that interacting with elements outside the chat box triggers its closure.
    
- ***windowposition***
    
    You have the option to choose between two chat box positioning styles. The chat box can be positioned either on the right-bottom side or on the left-bottom side of the screen. To specify your preferred window position, use the **`windowposition`** attribute accordingly. Its value can be `BOTTOM_LEFT` and `BOTTOM_RIGHT`.
    
- ***brandlogo***
    
    Upon the appearance of the chat box bubble, you have the option to display your own brand logo or any PNG image of your preference. To do so, provide the URL of the PNG image using the `**brandlogo**` attribute. This allows you to seamlessly incorporate your chosen image into the chat box interface.
    
- ***bubbletext***
    
    Should you opt to display accompanying bubble text alongside your brand logo, you can input that content using the `**bubbletext**` attribute. This text will be visible in conjunction with your brand logo within the chat box interface.
    
- ***bubbledelay***
    At times, you may desire to display the tooltip text after a specified delay. To achieve this, you can utilize the `**bubbledelay**` attribute and specify the delay duration in seconds.

- ***addgloweffect***
    To enable a pre-opening animation for the bubble icon before the user accesses the chat box, simply set `**addgloweffect**` to "true."

  
You also have the capability to include a welcome message and suggested responses that will appear when the chatbox is initially opened. A sample of that is provided in the above-mentioned code block.


![parts of cloudapper ai chatbox](https://github.com/cloudapperinc/ca-web-components/assets/79566517/09670fb0-4c25-4d5c-abdb-42a28ab19361)
