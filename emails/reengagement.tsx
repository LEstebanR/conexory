import { Text } from "@react-email/components"
import { EmailButton, EmailLayout, emailStyles } from "@/emails/components/layout"

export function ReengagementEmail({
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
      preview="Tu primera propiedad está a un minuto"
      appUrl={appUrl}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={emailStyles.heading}>Hola, {firstName}</Text>
      <Text style={emailStyles.text}>
        Te registraste en Conexory, pero todavía no has publicado ninguna
        propiedad. Sube las fotos, completa los datos básicos y obtén un link
        listo para compartir por WhatsApp, con vista previa incluida.
      </Text>
      <EmailButton href={`${appUrl}/dashboard/properties/new`}>
        Publicar mi primera propiedad
      </EmailButton>
    </EmailLayout>
  )
}

export default ReengagementEmail
