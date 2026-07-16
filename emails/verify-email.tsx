import { Text } from "@react-email/components"
import { EmailButton, EmailLayout, emailStyles } from "@/emails/components/layout"

export function VerifyEmailEmail({
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
    <EmailLayout preview="Confirma tu correo para activar tu cuenta" appUrl={appUrl}>
      <Text style={emailStyles.heading}>Hola, {firstName}</Text>
      <Text style={emailStyles.text}>
        Falta un paso para activar tu cuenta de Conexory: confirma que este es
        tu correo. El enlace expira en 1 hora. Si tú no creaste esta cuenta,
        ignora este correo.
      </Text>
      <EmailButton href={url}>Verificar mi correo</EmailButton>
    </EmailLayout>
  )
}

export default VerifyEmailEmail
