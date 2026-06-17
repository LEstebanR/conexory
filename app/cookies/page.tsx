import type { Metadata } from "next"
import LegalLayout, {
  LegalSection,
  LegalP,
  LegalList,
  LegalHighlight,
} from "@/components/legal-layout"

export const metadata: Metadata = {
  title: "Política de Cookies — Conexory",
  description: "Cómo usamos cookies y tecnologías similares en Conexory.",
}

const sections = [
  { id: "que-son", title: "¿Qué son las cookies?" },
  { id: "tipos", title: "Tipos de cookies que usamos" },
  { id: "terceros", title: "Cookies de terceros" },
  { id: "gestion", title: "Cómo gestionar las cookies" },
  { id: "cambios", title: "Cambios a esta política" },
  { id: "contacto", title: "Contacto" },
]

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Política de Cookies"
      description="Información sobre cómo Conexory utiliza cookies y tecnologías similares para operar la plataforma y mejorar tu experiencia."
      lastUpdated="31 de mayo de 2026"
      sections={sections}
    >
      <LegalHighlight>
        Conexory solo usa las cookies estrictamente necesarias para que la
        plataforma funcione. No usamos cookies de publicidad ni rastreo de
        terceros sin tu consentimiento.
      </LegalHighlight>

      <div className="mb-12" />

      <LegalSection id="que-son" number={1} title="¿Qué son las cookies?">
        <LegalP>
          Las cookies son pequeños archivos de texto que los sitios web almacenan
          en tu dispositivo cuando los visitas. Permiten que el sitio recuerde
          información sobre tu visita, como tu sesión iniciada o tus preferencias,
          para que puedas navegar de forma más eficiente.
        </LegalP>
        <LegalP>
          Además de las cookies, usamos tecnologías similares como
          <strong className="text-ink"> localStorage</strong> y{" "}
          <strong className="text-ink">sessionStorage</strong> del
          navegador para almacenar preferencias localmente sin enviarlas a
          nuestros servidores.
        </LegalP>
      </LegalSection>

      <LegalSection id="tipos" number={2} title="Tipos de cookies que usamos">
        <div className="space-y-6">
          <div className="bg-canvas-softer border border-hairline-strong rounded-xl p-5">
            <p className="font-semibold text-ink mb-2">
 Cookies esenciales
            </p>
            <p className="text-sm text-body mb-3">
              Indispensables para que la plataforma funcione. Sin ellas no
              puedes iniciar sesión ni usar el servicio.
            </p>
            <LegalList
              items={[
                "Cookie de sesión: mantiene tu sesión activa mientras navegas por el dashboard.",
                "Cookie CSRF: protege tus acciones contra ataques de falsificación de solicitudes.",
                "Cookie de preferencias de consentimiento: recuerda si ya aceptaste esta política.",
              ]}
            />
            <p className="text-xs text-mute mt-3">
              No pueden desactivarse. Son necesarias para operar el servicio.
            </p>
          </div>

          <div className="bg-canvas-softer border border-hairline-strong rounded-xl p-5">
            <p className="font-semibold text-ink mb-2">
 Cookies de análisis (opcionales)
            </p>
            <p className="text-sm text-body mb-3">
              Nos ayudan a entender cómo se usa la plataforma para mejorarla.
              Todos los datos son anonimizados.
            </p>
            <LegalList
              items={[
                "Páginas visitadas y tiempo de permanencia.",
                "Tipo de dispositivo y navegador.",
                "Errores técnicos que nos ayudan a detectar problemas.",
              ]}
            />
            <p className="text-xs text-mute mt-3">
              Puedes desactivarlas desde la configuración de tu navegador.
            </p>
          </div>
        </div>
      </LegalSection>

      <LegalSection id="terceros" number={3} title="Cookies de terceros">
        <LegalP>
          Conexory utiliza los siguientes servicios de terceros que pueden
          establecer sus propias cookies:
        </LegalP>
        <div className="bg-canvas-softer border border-hairline-strong rounded-xl p-5 space-y-3 text-sm">
          <div>
            <p className="font-semibold text-ink">Google OAuth</p>
            <p className="text-body">
              Si inicias sesión con Google, Google puede establecer cookies según
              su propia política de privacidad.
            </p>
          </div>
          <div>
            <p className="font-semibold text-ink">Vercel</p>
            <p className="text-body">
              Nuestra plataforma de hosting puede usar cookies técnicas para
              enrutamiento y rendimiento.
            </p>
          </div>
        </div>
        <LegalP>
          Para más información sobre cómo estos terceros usan cookies, consulta
          sus respectivas políticas de privacidad.
        </LegalP>
      </LegalSection>

      <LegalSection id="gestion" number={4} title="Cómo gestionar las cookies">
        <LegalP>
          Puedes controlar y eliminar las cookies desde la configuración de tu
          navegador. Aquí encontrarás instrucciones para los navegadores más
          comunes:
        </LegalP>
        <LegalList
          items={[
            "Chrome: Configuración → Privacidad y seguridad → Cookies y otros datos de sitios.",
            "Firefox: Opciones → Privacidad y seguridad → Cookies y datos del sitio.",
            "Safari: Preferencias → Privacidad → Gestionar datos del sitio web.",
            "Edge: Configuración → Cookies y permisos del sitio → Cookies y datos del sitio.",
          ]}
        />
        <LegalHighlight>
          Ten en cuenta que desactivar las cookies esenciales impedirá que puedas
          iniciar sesión y usar el servicio correctamente.
        </LegalHighlight>
      </LegalSection>

      <LegalSection id="cambios" number={5} title="Cambios a esta política">
        <LegalP>
          Podemos actualizar esta política cuando añadamos nuevas funcionalidades
          o cambiemos los servicios que usamos. La fecha de &ldquo;última actualización&rdquo;
          en la parte superior siempre refleja la versión vigente.
        </LegalP>
      </LegalSection>

      <LegalSection id="contacto" number={6} title="Contacto">
        <LegalP>
          Si tienes preguntas sobre el uso de cookies en Conexory, escríbenos:
        </LegalP>
        <div className="bg-canvas-softer border border-hairline-strong rounded-xl p-5 space-y-2 text-sm">
          <p>
            <span className="font-semibold text-ink">Correo:</span>{" "}
            <a
              href="mailto:privacidad@conexory.com"
              className="text-ink hover:underline"
            >
              privacidad@conexory.com
            </a>
          </p>
          <p>
            <span className="font-semibold text-ink">Ciudad:</span>{" "}
            Bogotá D.C., Colombia
          </p>
        </div>
      </LegalSection>
    </LegalLayout>
  )
}
