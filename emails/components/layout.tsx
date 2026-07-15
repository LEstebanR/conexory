import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

const FONT_FAMILY =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"

export const emailStyles = {
  heading: {
    fontFamily: FONT_FAMILY,
    fontSize: "24px",
    fontWeight: 800,
    color: "#000000",
    margin: "0 0 8px",
    letterSpacing: "-0.3px",
  },
  text: {
    fontFamily: FONT_FAMILY,
    fontSize: "15px",
    lineHeight: "24px",
    color: "#5e5e5e",
    margin: "0 0 24px",
  },
  muted: {
    fontFamily: FONT_FAMILY,
    fontSize: "13px",
    lineHeight: "20px",
    color: "#afafaf",
    margin: "0",
  },
} as const

export function EmailButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button
      href={href}
      style={{
        fontFamily: FONT_FAMILY,
        display: "inline-block",
        backgroundColor: "#000000",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: 700,
        padding: "14px 28px",
        borderRadius: "9999px",
        textDecoration: "none",
      }}
    >
      {children}
    </Button>
  )
}

export function EmailLayout({
  preview,
  appUrl,
  children,
}: {
  preview: string
  appUrl: string
  children: React.ReactNode
}) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#f3f3f3", margin: 0, padding: "32px 16px" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            maxWidth: "480px",
            margin: "0 auto",
            borderRadius: "16px",
            padding: "32px",
          }}
        >
          <Section style={{ marginBottom: "24px" }}>
            <Text
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: "18px",
                fontWeight: 900,
                color: "#000000",
                letterSpacing: "-0.5px",
                margin: 0,
              }}
            >
              Conexory
            </Text>
          </Section>

          {children}

          <Hr style={{ borderColor: "#e2e2e2", margin: "32px 0 16px" }} />
          <Text style={emailStyles.muted}>
            Conexory · Colombia
            <br />
            <Link href={`${appUrl}/privacy`} style={{ color: "#afafaf" }}>
              Privacidad
            </Link>{" "}
            ·{" "}
            <Link href={`${appUrl}/terms`} style={{ color: "#afafaf" }}>
              Términos
            </Link>{" "}
            ·{" "}
            <Link href={`${appUrl}/contacto`} style={{ color: "#afafaf" }}>
              Contacto
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
