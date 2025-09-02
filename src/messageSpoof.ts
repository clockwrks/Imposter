import { FluxDispatcher } from 'enmity/api/fluxDispatcher'
import { storage } from 'enmity/api/storage'
import { getByStoreName } from 'enmity/api/modules'

const UserStore = getByStoreName('UserStore')

function spoofMessage(event: any) {
  const settings = storage.get('ImposterSettings', {
    active: true,
    subjectUserId: '',
    targetUserId: ''
  })

  if (!settings.active) return
  if (event?.message?.author?.id === settings.targetUserId) {
    const subject = UserStore.getUser(settings.subjectUserId)
    if (!subject) return

    event.message.author = {
      ...event.message.author,
      username: subject.username,
      avatar: subject.avatar,
      discriminator: subject.discriminator,
      id: subject.id
    }
  }
}

export function enableMessageSpoof() {
  FluxDispatcher.subscribe('MESSAGE_CREATE', spoofMessage)
  FluxDispatcher.subscribe('MESSAGE_UPDATE', spoofMessage)
}

export function disableMessageSpoof() {
  FluxDispatcher.unsubscribe('MESSAGE_CREATE', spoofMessage)
  FluxDispatcher.unsubscribe('MESSAGE_UPDATE', spoofMessage)
}
