import { Text } from "@react-email/components"
import { EmailButton, EmailLayout, emailStyles } from "@/emails/components/layout"

export function PaymentFailedEmail({
  name,
  appUrl,
}: {
  name: string
  appUrl: string
}) {
  const firstName = name.split(" ")[0]
  return (
    <EmailLayout preview="No pudimos cobrar tu plan Pro" appUrl={appUrl}>
      <Text style={emailStyles.heading}>Hola, {firstName}</Text>
      <Text style={emailStyles.text}>
        Intentamos cobrar tu plan Pro de Conexory y el pago no pasó. No hay
        problema — puedes actualizar tu método de pago desde el dashboard. Si
        no lo resolvemos pronto, tu cuenta pasará al plan Free y algunas
        propiedades podrían dejar de estar publicadas.
      </Text>
      <EmailButton href={`${appUrl}/dashboard/upgrade`}>
        Actualizar método de pago
      </EmailButton>
    </EmailLayout>
  )
}

export default PaymentFailedEmail
