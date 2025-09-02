import { Plugin, registerPlugin } from 'enmity/managers/plugins'
import { patcher } from 'enmity/api/patcher'
import { storage } from 'enmity/api/storage'
import { getByStoreName } from 'enmity/api/modules'
import { enableMessageSpoof, disableMessageSpoof } from './messageSpoof'
import Settings from './components/Settings'

const UserStore = getByStoreName('UserStore')
const UserProfileStore = getByStoreName('UserProfileStore')
const PresenceStore = getByStoreName('PresenceStore')
const GuildMemberStore = getByStoreName('GuildMemberStore')

const Imposter: Plugin = {
  name: 'Imposter',
  description: 'Impersonate another user by spoofing their profile and messages.',
  authors: [{ name: 'eeriemyxi', id: '598134630104825856' }],
  version: '0.0.3',

  async onStart() {
    const settings = storage.get('ImposterSettings', {
      active: true,
      subjectUserId: '',
      targetUserId: ''
    })

    // Patch UserStore.getUser
    patcher.after('ImposterUser', UserStore, 'getUser', (self, args, res) => {
      if (!settings.active) return
      if (res?.id === settings.targetUserId) {
        const subject = UserStore.getUser(settings.subjectUserId)
        if (!subject) return
        return { ...res, ...subject }
      }
    })

    // Patch UserProfileStore.getUserProfile
    patcher.after('ImposterProfile', UserProfileStore, 'getUserProfile', (self, args, res) => {
      if (!settings.active) return
      if (res?.userId === settings.targetUserId) {
        const subject = UserProfileStore.getUserProfile(settings.subjectUserId)
        if (!subject) return
        return { ...res, ...subject }
      }
    })

    // Patch PresenceStore.getPrimaryActivity
    patcher.after('ImposterPresence', PresenceStore, 'getPrimaryActivity', (self, args, res) => {
      if (!settings.active) return
      if (args[0] === settings.targetUserId) {
        return PresenceStore.getPrimaryActivity(settings.subjectUserId) || res
      }
    })

    // Patch GuildMemberStore.getMember
    patcher.after('ImposterMember', GuildMemberStore, 'getMember', (self, args, res) => {
      if (!settings.active) return
      if (args[1] === settings.targetUserId) {
        const subject = GuildMemberStore.getMember(args[0], settings.subjectUserId)
        if (!subject) return res
        return { ...res, nick: subject.nick || subject.globalName }
      }
    })

    if (settings.active) enableMessageSpoof()
  },

  onStop() {
    patcher.unpatchAll()
    disableMessageSpoof()
  },

  getSettingsPanel() {
    return <Settings />
  }
}

registerPlugin(Imposter)
