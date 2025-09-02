import React from 'react'
import { storage } from 'enmity/api/storage'
import { FormSection, FormSwitch, FormInput } from 'enmity/components'
import { enableMessageSpoof, disableMessageSpoof } from '../messageSpoof'

export default function Settings() {
  const settings = storage.get('ImposterSettings', {
    active: true,
    subjectUserId: '',
    targetUserId: ''
  })

  return (
    <FormSection title='Imposter Settings'>
      <FormSwitch
        label='Enable Plugin'
        value={settings.active}
        onValueChange={(v: boolean) => {
          settings.active = v
          storage.set('ImposterSettings', settings)
          if (v) enableMessageSpoof()
          else disableMessageSpoof()
        }}
      />
      <FormInput
        title='Subject User ID'
        value={settings.subjectUserId}
        onChange={(val: string) => {
          settings.subjectUserId = val
          storage.set('ImposterSettings', settings)
        }}
      />
      <FormInput
        title='Target User ID'
        value={settings.targetUserId}
        onChange={(val: string) => {
          settings.targetUserId = val
          storage.set('ImposterSettings', settings)
        }}
      />
    </FormSection>
  )
}
