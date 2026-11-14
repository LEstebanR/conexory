import { Text } from "@react-email/components"
import { EmailButton, EmailLayout, emailStyles } from "@/emails/components/layout"
import { PRO_PROPERTY_LIMIT } from "@/lib/plans"

export function WinbackEmail({
  name,
  appUrl,
  unsubscribeUrl,
}: {
  name: string
  appUrl: string
  unsubscribeUrl: string
}) {
  const firstName = name.split(" ")[0]
  return (
    <EmailLayout
      preview="Tu plan Pro te está esperando"
      appUrl={appUrl}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={emailStyles.heading}>Hola, {firstName}</Text>
      <Text style={emailStyles.text}>
        Hace unas semanas tu cuenta pasó al plan gratuito. Las propiedades que
        quedaron sin publicar siguen guardadas: si vuelves a Pro, puedes
        reactivarlas y publicar hasta {PRO_PROPERTY_LIMIT} propiedades.
      </Text>
      <EmailButton href={`${appUrl}/dashboard/upgrade`}>
        Volver a Pro
      </EmailButton>
    </EmailLayout>
  )
}

export default WinbackEmail
