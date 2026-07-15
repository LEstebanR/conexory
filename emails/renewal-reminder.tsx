import { Text } from "@react-email/components"
import { EmailButton, EmailLayout, emailStyles } from "@/emails/components/layout"

export function RenewalReminderEmail({
  name,
  date,
  hasPaymentMethod,
  appUrl,
}: {
  name: string
  date: string
  hasPaymentMethod: boolean
  appUrl: string
}) {
  const firstName = name.split(" ")[0]
  return (
    <EmailLayout preview={`Tu plan Pro se renueva el ${date}`} appUrl={appUrl}>
      <Text style={emailStyles.heading}>Hola, {firstName}</Text>
      {hasPaymentMethod ? (
        <Text style={emailStyles.text}>
          El {date} renovaremos tu plan Pro de Conexory por $99.999 COP con el
          método de pago que tienes registrado. No tienes que hacer nada para
          continuar; si quieres cancelar, puedes hacerlo desde el dashboard.
        </Text>
      ) : (
        <Text style={emailStyles.text}>
          Tu plan Pro de Conexory vence el {date} y no tenemos un método de
          pago guardado para renovarlo automáticamente. Si quieres seguir en
          Pro después de esa fecha, agrega un método de pago antes de que
          venza.
        </Text>
      )}
      <EmailButton href={`${appUrl}/dashboard`}>Ir al dashboard</EmailButton>
    </EmailLayout>
  )
}

export default RenewalReminderEmail
