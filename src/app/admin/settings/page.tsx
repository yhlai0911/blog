import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import SettingsForm from '@/components/admin/SettingsForm'

export const metadata: Metadata = {
  title: '設定 - 後台管理',
}

const SETTINGS_ID = 'site_settings'

async function getSettings() {
  let settings = await prisma.settings.findUnique({
    where: { id: SETTINGS_ID },
  })

  if (!settings) {
    settings = await prisma.settings.create({
      data: { id: SETTINGS_ID },
    })
  }

  return settings
}

export default async function SettingsPage() {
  const settings = await getSettings()

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">網站設定</h1>
        <p className="mt-2 text-gray-600">
          管理您的網站基本資訊、社群連結與 SEO 設定
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <SettingsForm settings={settings} />
      </div>
    </div>
  )
}
