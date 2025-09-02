import { Plugin, registerPlugin } from 'enmity/api/plugins';
import { getByProps } from 'enmity/modules';
import { patcher } from 'enmity/api';
import { Toasts } from 'enmity/api/native';

// Cache the sendMessage module to avoid looking for it every time
const sendMessageModule = getByProps("sendMessage");

// Define the plugin
const SimplePlugin: Plugin = {
  name: 'SimplePlugin',
  version: '1.0.0',
  description: 'A simple plugin that adds a suffix to sent messages.',
  authors: [
    {
      name: 'You!',
      id: '000000000000000000', // You can put your Discord ID here
    },
  ],

  // onStart is called when the plugin is enabled
  onStart() {
    // We use the patcher to modify the 'sendMessage' function.
    // 'before' means our code runs before the original function.
    patcher.before(sendMessageModule, 'sendMessage', (self, args, orig) => {
      // The actual message content is nested in the arguments.
      // We'll add our suffix to it.
      const messageContent: string = args[1]?.content;

      if (messageContent) {
        args[1].content = `${messageContent} (Sent with my cool plugin!)`;
      }
      
      // We can also log to the console to see what's happening
      console.log('Patched sendMessage, new content:', args[1].content);
    });

    // Show a toast message to confirm the plugin is active
    Toasts.show({
      message: 'Simple Plugin Activated!',
      type: 'success', // 'success', 'error', or 'info'
    });
  },

  // onStop is called when the plugin is disabled
  onStop() {
    // It's very important to remove all patches when the plugin is stopped.
    // This prevents conflicts and errors.
    patcher.unpatchAll();
    
    // Show a toast message to confirm the plugin is deactivated
    Toasts.show({
      message: 'Simple Plugin Deactivated.',
      type: 'info',
    });
  },
};

// This is the final step that registers our plugin with Enmity
registerPlugin(SimplePlugin);

