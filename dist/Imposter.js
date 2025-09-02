var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.tsx
var import_plugins = require("enmity/managers/plugins");
var import_patcher = require("enmity/api/patcher");
var import_storage3 = require("enmity/api/storage");
var import_modules2 = require("enmity/api/modules");

// src/messageSpoof.ts
var import_fluxDispatcher = require("enmity/api/fluxDispatcher");
var import_storage = require("enmity/api/storage");
var import_modules = require("enmity/api/modules");
var UserStore = (0, import_modules.getByStoreName)("UserStore");
function spoofMessage(event) {
  const settings = import_storage.storage.get("ImposterSettings", {
    active: true,
    subjectUserId: "",
    targetUserId: ""
  });
  if (!settings.active) return;
  if (event?.message?.author?.id === settings.targetUserId) {
    const subject = UserStore.getUser(settings.subjectUserId);
    if (!subject) return;
    event.message.author = {
      ...event.message.author,
      username: subject.username,
      avatar: subject.avatar,
      discriminator: subject.discriminator,
      id: subject.id
    };
  }
}
function enableMessageSpoof() {
  import_fluxDispatcher.FluxDispatcher.subscribe("MESSAGE_CREATE", spoofMessage);
  import_fluxDispatcher.FluxDispatcher.subscribe("MESSAGE_UPDATE", spoofMessage);
}
function disableMessageSpoof() {
  import_fluxDispatcher.FluxDispatcher.unsubscribe("MESSAGE_CREATE", spoofMessage);
  import_fluxDispatcher.FluxDispatcher.unsubscribe("MESSAGE_UPDATE", spoofMessage);
}

// src/components/Settings.tsx
var import_react = __toESM(require("react"));
var import_storage2 = require("enmity/api/storage");
var import_components = require("enmity/components");
function Settings() {
  const settings = import_storage2.storage.get("ImposterSettings", {
    active: true,
    subjectUserId: "",
    targetUserId: ""
  });
  return /* @__PURE__ */ import_react.default.createElement(import_components.FormSection, { title: "Imposter Settings" }, /* @__PURE__ */ import_react.default.createElement(
    import_components.FormSwitch,
    {
      label: "Enable Plugin",
      value: settings.active,
      onValueChange: (v) => {
        settings.active = v;
        import_storage2.storage.set("ImposterSettings", settings);
        if (v) enableMessageSpoof();
        else disableMessageSpoof();
      }
    }
  ), /* @__PURE__ */ import_react.default.createElement(
    import_components.FormInput,
    {
      title: "Subject User ID",
      value: settings.subjectUserId,
      onChange: (val) => {
        settings.subjectUserId = val;
        import_storage2.storage.set("ImposterSettings", settings);
      }
    }
  ), /* @__PURE__ */ import_react.default.createElement(
    import_components.FormInput,
    {
      title: "Target User ID",
      value: settings.targetUserId,
      onChange: (val) => {
        settings.targetUserId = val;
        import_storage2.storage.set("ImposterSettings", settings);
      }
    }
  ));
}

// src/index.tsx
var UserStore2 = (0, import_modules2.getByStoreName)("UserStore");
var UserProfileStore = (0, import_modules2.getByStoreName)("UserProfileStore");
var PresenceStore = (0, import_modules2.getByStoreName)("PresenceStore");
var GuildMemberStore = (0, import_modules2.getByStoreName)("GuildMemberStore");
var Imposter = {
  name: "Imposter",
  description: "Impersonate another user by spoofing their profile and messages.",
  authors: [{ name: "eeriemyxi", id: "598134630104825856" }],
  version: "0.0.3",
  async onStart() {
    const settings = import_storage3.storage.get("ImposterSettings", {
      active: true,
      subjectUserId: "",
      targetUserId: ""
    });
    import_patcher.patcher.after("ImposterUser", UserStore2, "getUser", (self, args, res) => {
      if (!settings.active) return;
      if (res?.id === settings.targetUserId) {
        const subject = UserStore2.getUser(settings.subjectUserId);
        if (!subject) return;
        return { ...res, ...subject };
      }
    });
    import_patcher.patcher.after("ImposterProfile", UserProfileStore, "getUserProfile", (self, args, res) => {
      if (!settings.active) return;
      if (res?.userId === settings.targetUserId) {
        const subject = UserProfileStore.getUserProfile(settings.subjectUserId);
        if (!subject) return;
        return { ...res, ...subject };
      }
    });
    import_patcher.patcher.after("ImposterPresence", PresenceStore, "getPrimaryActivity", (self, args, res) => {
      if (!settings.active) return;
      if (args[0] === settings.targetUserId) {
        return PresenceStore.getPrimaryActivity(settings.subjectUserId) || res;
      }
    });
    import_patcher.patcher.after("ImposterMember", GuildMemberStore, "getMember", (self, args, res) => {
      if (!settings.active) return;
      if (args[1] === settings.targetUserId) {
        const subject = GuildMemberStore.getMember(args[0], settings.subjectUserId);
        if (!subject) return res;
        return { ...res, nick: subject.nick || subject.globalName };
      }
    });
    if (settings.active) enableMessageSpoof();
  },
  onStop() {
    import_patcher.patcher.unpatchAll();
    disableMessageSpoof();
  },
  getSettingsPanel() {
    return /* @__PURE__ */ React.createElement(Settings, null);
  }
};
(0, import_plugins.registerPlugin)(Imposter);
