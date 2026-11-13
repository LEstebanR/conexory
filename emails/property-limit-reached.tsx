import { Text } from "@react-email/components"
import { EmailButton, EmailLayout, emailStyles } from "@/emails/components/layout"
import { FREE_PROPERTY_LIMIT, PRO_PHOTO_LIMIT, PRO_PROPERTY_LIMIT } from "@/lib/plans"

export function PropertyLimitReachedEmail({
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
      preview={`Llegaste a tus ${FREE_PROPERTY_LIMIT} propiedades del plan gratuito`}
      appUrl={appUrl}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={emailStyles.heading}>Hola, {firstName}</Text>
      <Text style={emailStyles.text}>
        Ya tienes {FREE_PROPERTY_LIMIT} propiedades activas, el máximo del plan
        gratuito. Con Pro puedes publicar hasta {PRO_PROPERTY_LIMIT} propiedades,
        subir hasta {PRO_PHOTO_LIMIT} fotos por propiedad y generar mensajes de
        WhatsApp con IA.
      </Text>
      <EmailButton href={`${appUrl}/dashboard/upgrade`}>
        Conocer el plan Pro
      </EmailButton>
    </EmailLayout>
  )
}

export default PropertyLimitReachedEmail
