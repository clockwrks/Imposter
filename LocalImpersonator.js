const {
    plugin: {
        store,
        Plugin,
        patch,
        unpatch
    },
    // The "api" object provides access to Discord's internal modules and utilities.
    api: {
        find,
        findAndPatch,
        React,
        // The store is where Discord's data is kept. You can get a user's data from here.
        stores: {
            UserStore
        }
    },
    // We need to import the UI components for our settings page.
    ui: {
        components: {
            TextInput
        }
    }
} = enmity;

// Plugin metadata
const plugin = new Plugin({
    name: 'User Avatar Changer',
    author: 'Your Name',
    description: 'Changes your profile picture to another user\'s avatar by ID.',
    version: '1.0.0',
    id: 'user-avatar-changer'
});

// A variable to store the original avatar URL so we can restore it later.
let originalAvatarUrl = null;

// Define the settings for the plugin.
plugin.settings = {
    // Set the initial default value for the user ID.
    setDefaults() {
        return {
            targetUserId: ''
        };
    },
    // This is the function that renders the settings page.
    render() {
        const { targetUserId } = store;
        return (
            // A simple UI component to get a user ID from the user.
            <TextInput
                title='Target User ID'
                placeholder='Enter a Discord user ID'
                value={targetUserId}
                onChange={value => {
                    // Update the setting when the user types.
                    store.targetUserId = value;
                }}
            />
        );
    }
};

plugin.onstart = () => {
    // Get the target user's ID from the plugin's store.
    const targetUserId = store.targetUserId;
    
    if (!targetUserId) {
        alert('Please enter a user ID in the plugin settings.');
        return;
    }
    
    // 1. Get the target user's data from the Discord store.
    const targetUser = UserStore.getUser(targetUserId);
    
    // Check if the user exists.
    if (!targetUser) {
        alert('User not found. Please check the ID.');
        return;
    }

    // 2. Find the internal Discord module that gets the current user's avatar URL.
    // This is the most critical part and may require some debugging to find.
    // The name could be something like 'getSelfAvatarURL', 'getCurrentUserAvatar', etc.
    // Use the `find` or `findAndPatch` utility with a function signature you can recognize.
    const avatarModule = find(m => m.default && typeof m.default.getAvatarURL === 'function');
    
    // We are looking for a module that has a function to get the avatar URL.
    if (avatarModule) {
        // 3. Patch the function to return the target user's avatar URL instead of our own.
        // We use `patch` to modify the original function's behavior without rewriting it.
        patch(avatarModule.default, 'getAvatarURL', (_, originalArgs) => {
            // Get the current user ID to ensure we only patch our own avatar.
            const currentUserId = originalArgs[0];
            
            if (currentUserId === UserStore.getCurrentUser().id) {
                // Return the target user's avatar URL.
                return targetUser.getAvatarURL();
            }
            
            // If it's not our own user, let the original function run.
            return originalArgs;
        });
        
        console.log('User Avatar Changer: Successfully patched avatar URL.');
    } else {
        alert('Could not find the avatar module to patch. The plugin may not work.');
    }
};

plugin.onstop = () => {
    // 1. Unpatch the function to restore the original Discord behavior.
    // It's crucial to clean up to avoid conflicts and issues.
    unpatchAll(plugin.id);
    console.log('User Avatar Changer: Plugin stopped and avatar URL patched function restored.');
};

// A helper function to unpatch all patches made by this plugin.
function unpatchAll(id) {
    patch.patches.forEach(p => {
        if (p.id === id) {
            p.unpatch();
        }
    });
}

module.exports = plugin;
