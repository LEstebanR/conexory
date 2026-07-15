import { Text } from "@react-email/components"
import { EmailButton, EmailLayout, emailStyles } from "@/emails/components/layout"

export function ResetPasswordEmail({
  name,
  url,
  appUrl,
}: {
  name: string
  url: string
  appUrl: string
}) {
  const firstName = name.split(" ")[0]
  return (
    <EmailLayout preview="Recupera tu contraseña de Conexory" appUrl={appUrl}>
      <Text style={emailStyles.heading}>Hola, {firstName}</Text>
      <Text style={emailStyles.text}>
        Haz clic en el botón de abajo para crear una nueva contraseña. El
        enlace expira en 1 hora. Si no solicitaste este cambio, ignora este
        correo.
      </Text>
      <EmailButton href={url}>Restablecer contraseña</EmailButton>
    </EmailLayout>
  )
}

export default ResetPasswordEmail
