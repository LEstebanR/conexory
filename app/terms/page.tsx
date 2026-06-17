import type { Metadata } from "next"
import LegalLayout, {
  LegalSection,
  LegalP,
  LegalList,
  LegalSubtitle,
  LegalHighlight,
} from "@/components/legal-layout"

export const metadata: Metadata = {
  title: "Términos de Uso — Conexory",
  description:
    "Términos y condiciones de uso de la plataforma Conexory para agentes inmobiliarios en Colombia.",
}

const sections = [
  { id: "aceptacion", title: "Aceptación de los términos" },
  { id: "servicio", title: "El servicio Conexory" },
  { id: "cuenta", title: "Registro y cuenta" },
  { id: "uso-aceptable", title: "Uso aceptable" },
  { id: "contenido", title: "Tu contenido" },
  { id: "propiedad-intelectual", title: "Propiedad intelectual" },
  { id: "planes-pagos", title: "Planes y pagos" },
  { id: "disponibilidad", title: "Disponibilidad del servicio" },
  { id: "responsabilidad", title: "Limitación de responsabilidad" },
  { id: "terminacion", title: "Terminación de la cuenta" },
  { id: "ley-aplicable", title: "Ley aplicable" },
  { id: "cambios", title: "Cambios a estos términos" },
  { id: "contacto", title: "Contacto" },
]

export default function TermsPage() {
  return (
    <LegalLayout
      title="Términos de Uso"
      description="Estos términos rigen el uso de la plataforma Conexory. Léelos con atención antes de crear tu cuenta."
      lastUpdated="31 de mayo de 2026"
      sections={sections}
    >
      <LegalSection id="aceptacion" number={1} title="Aceptación de los términos">
        <LegalP>
          Al acceder o utilizar la plataforma Conexory (en adelante, &ldquo;el
          Servicio&rdquo;), aceptas quedar vinculado por estos Términos de Uso
          y por nuestra Política de Privacidad. Si no estás de acuerdo con
          alguna de estas condiciones, no debes utilizar el Servicio.
        </LegalP>
        <LegalP>
          Estos términos constituyen un acuerdo legal entre tú (el
          &ldquo;Usuario&rdquo;) y Conexory SAS, sociedad constituida bajo las
          leyes de la República de Colombia, con domicilio en Bogotá D.C.
        </LegalP>
        <LegalHighlight>
          Al hacer clic en &ldquo;Crear cuenta&rdquo; o al usar el Servicio,
          confirmas que tienes al menos 18 años y capacidad legal para suscribir
          contratos en Colombia.
        </LegalHighlight>
      </LegalSection>

      <LegalSection id="servicio" number={2} title="El servicio Conexory">
        <LegalP>
          Conexory es una plataforma SaaS (Software como Servicio) que permite
          a agentes inmobiliarios crear fichas de propiedades y compartirlas
          mediante un link único. El Servicio incluye, entre otras
          funcionalidades:
        </LegalP>
        <LegalList
          items={[
            "Creación y gestión de fichas de propiedades con fotos, precio y descripción.",
            "Generación de un link único por propiedad para compartir con interesados.",
            "Botón de contacto directo por WhatsApp integrado en cada ficha.",
            "Galería pública con todas las propiedades del agente.",
            "Acceso desde dispositivos móviles y de escritorio.",
          ]}
        />
        <LegalP>
          Conexory es una herramienta de difusión y gestión. No actuamos como
          intermediario inmobiliario, no participamos en las negociaciones entre
          agentes y compradores o arrendatarios, y no somos responsables del
          resultado de ninguna transacción inmobiliaria.
        </LegalP>
      </LegalSection>

      <LegalSection id="cuenta" number={3} title="Registro y cuenta">
        <LegalSubtitle>Creación de cuenta</LegalSubtitle>
        <LegalP>
          Para usar el Servicio debes registrarte proporcionando información
          veraz, completa y actualizada. Puedes hacerlo con un correo
          electrónico y contraseña, o a través de tu cuenta de Google.
        </LegalP>
        <LegalSubtitle>Seguridad de las credenciales</LegalSubtitle>
        <LegalP>
          Eres el único responsable de mantener la confidencialidad de tus
          credenciales de acceso. Debes notificarnos inmediatamente a{" "}
          <a
            href="mailto:soporte@conexory.com"
            className="text-brand-500 font-semibold hover:underline"
          >
            soporte@conexory.com
          </a>{" "}
          si detectas acceso no autorizado a tu cuenta.
        </LegalP>
        <LegalSubtitle>Una cuenta por usuario</LegalSubtitle>
        <LegalP>
          Cada persona natural puede tener una cuenta activa. Cuentas de equipos
          o agencias inmobiliarias están disponibles bajo planes especiales; escríbenos
          para conocer las opciones.
        </LegalP>
      </LegalSection>

      <LegalSection id="uso-aceptable" number={4} title="Uso aceptable">
        <LegalP>
          Al usar Conexory te comprometes a no realizar ninguna de las
          siguientes acciones:
        </LegalP>
        <LegalList
          items={[
            "Publicar propiedades ficticias, con precios engañosos o información falsa.",
            "Usar el Servicio para actividades ilegales, incluyendo lavado de activos.",
            "Subir contenido que infrinja derechos de autor, marcas registradas o privacidad de terceros.",
            "Intentar acceder a cuentas de otros usuarios o a los sistemas internos de Conexory.",
            "Usar bots, scrapers o herramientas automatizadas para extraer contenido de la plataforma.",
            "Revender, sublicenciar o transferir el acceso al Servicio a terceros.",
            "Publicar contenido ofensivo, discriminatorio o que viole las leyes colombianas.",
          ]}
        />
        <LegalP>
          Conexory se reserva el derecho de suspender o eliminar cuentas que
          incumplan estas condiciones sin previo aviso y sin obligación de
          reembolso.
        </LegalP>
      </LegalSection>

      <LegalSection id="contenido" number={5} title="Tu contenido">
        <LegalSubtitle>Propiedad del contenido</LegalSubtitle>
        <LegalP>
          Todo el contenido que publicas en Conexory (fotos, descripciones,
          precios, datos de contacto) es de tu propiedad o tienes los derechos
          necesarios para usarlo. Conexory no reclama propiedad sobre tu
          contenido.
        </LegalP>
        <LegalSubtitle>Licencia que nos otorgas</LegalSubtitle>
        <LegalP>
          Al subir contenido al Servicio, nos otorgas una licencia mundial, no
          exclusiva, libre de regalías y sublicenciable para almacenar, mostrar,
          reproducir y distribuir dicho contenido únicamente con el propósito de
          operar y mejorar el Servicio.
        </LegalP>
        <LegalSubtitle>Responsabilidad del contenido</LegalSubtitle>
        <LegalP>
          Eres el único responsable por el contenido que publicas. Garantizas
          que tienes los derechos sobre las fotos y que la información de cada
          propiedad es veraz y no induce a error a los interesados.
        </LegalP>
        <LegalHighlight>
          Conexory puede eliminar contenido que, a su criterio, viole estos
          términos, las leyes colombianas o los derechos de terceros, sin que
          ello genere responsabilidad alguna de nuestra parte.
        </LegalHighlight>
      </LegalSection>

      <LegalSection id="propiedad-intelectual" number={6} title="Propiedad intelectual">
        <LegalP>
          La plataforma Conexory, incluyendo su diseño, código fuente, marca,
          logotipo, interfaces y funcionalidades, es propiedad exclusiva de
          Conexory SAS y está protegida por las leyes de propiedad intelectual
          de Colombia y tratados internacionales.
        </LegalP>
        <LegalP>
          Nada en estos términos te otorga derecho a usar la marca, el nombre
          comercial o cualquier otro signo distintivo de Conexory sin nuestra
          autorización expresa y por escrito.
        </LegalP>
      </LegalSection>

      <LegalSection id="planes-pagos" number={7} title="Planes y pagos">
        <LegalSubtitle>Plan gratuito</LegalSubtitle>
        <LegalP>
          Conexory ofrece un plan gratuito con funcionalidades limitadas. No se
          requiere tarjeta de crédito para registrarse ni para usar el plan
          gratuito.
        </LegalP>
        <LegalSubtitle>Plan Pro</LegalSubtitle>
        <LegalP>
          El plan Pro se cobra mensualmente en pesos colombianos (COP) según la
          tarifa vigente en el momento de la suscripción. Los precios pueden
          consultarse en nuestra página principal. Los pagos son procesados por
          pasarelas de pago certificadas.
        </LegalP>
        <LegalSubtitle>Cancelación y reembolsos</LegalSubtitle>
        <LegalP>
          Puedes cancelar tu suscripción en cualquier momento desde la
          configuración de tu cuenta. La cancelación entra en vigor al final del
          período de facturación activo. No realizamos reembolsos prorrateados
          por períodos no utilizados, salvo cuando la ley colombiana lo exija.
        </LegalP>
      </LegalSection>

      <LegalSection id="disponibilidad" number={8} title="Disponibilidad del servicio">
        <LegalP>
          Nos esforzamos por mantener el Servicio disponible las 24 horas del
          día, los 7 días de la semana. Sin embargo, no garantizamos
          disponibilidad ininterrumpida. Podemos suspender temporalmente el
          acceso por mantenimiento, actualizaciones o causas fuera de nuestro
          control.
        </LegalP>
        <LegalP>
          Conexory no será responsable por pérdidas o daños derivados de
          interrupciones del servicio, pérdida de datos o fallos técnicos, en la
          medida en que lo permita la ley aplicable.
        </LegalP>
      </LegalSection>

      <LegalSection id="responsabilidad" number={9} title="Limitación de responsabilidad">
        <LegalP>
          En la máxima medida permitida por la ley colombiana, Conexory no será
          responsable por:
        </LegalP>
        <LegalList
          items={[
            "El resultado de negociaciones inmobiliarias gestionadas a través de la plataforma.",
            "Daños indirectos, incidentales, especiales o consecuentes derivados del uso del Servicio.",
            "Pérdida de datos, ganancias o clientes potenciales.",
            "Acciones de terceros, incluyendo compradores, arrendatarios u otros agentes.",
            "Contenido publicado por otros usuarios en la plataforma.",
          ]}
        />
        <LegalP>
          Nuestra responsabilidad total frente a ti, por cualquier causa, no
          superará el valor que hayas pagado a Conexory en los tres (3) meses
          anteriores al evento que originó el reclamo.
        </LegalP>
      </LegalSection>

      <LegalSection id="terminacion" number={10} title="Terminación de la cuenta">
        <LegalSubtitle>Por parte del usuario</LegalSubtitle>
        <LegalP>
          Puedes eliminar tu cuenta en cualquier momento desde la sección
          &ldquo;Configuración&rdquo; de tu perfil. Una vez eliminada, todos tus
          datos y contenido serán borrados de nuestros servidores en un plazo de
          30 días, salvo obligación legal de conservarlos.
        </LegalP>
        <LegalSubtitle>Por parte de Conexory</LegalSubtitle>
        <LegalP>
          Podemos suspender o terminar tu acceso al Servicio si incumples estos
          términos, si detectamos actividad fraudulenta o si dejamos de operar
          el Servicio. En caso de cierre de la plataforma, te notificaremos con
          al menos 30 días de anticipación.
        </LegalP>
      </LegalSection>

      <LegalSection id="ley-aplicable" number={11} title="Ley aplicable">
        <LegalP>
          Estos términos se rigen por las leyes de la República de Colombia.
          Cualquier disputa que no pueda resolverse de manera amigable será
          sometida a los jueces y tribunales competentes de Bogotá D.C.,
          Colombia, renunciando a cualquier otro fuero que pudiera corresponder.
        </LegalP>
        <LegalP>
          Las partes procurarán resolver cualquier controversia mediante
          negociación directa durante un período de 30 días antes de acudir a
          instancias judiciales.
        </LegalP>
      </LegalSection>

      <LegalSection id="cambios" number={12} title="Cambios a estos términos">
        <LegalP>
          Nos reservamos el derecho de modificar estos términos en cualquier
          momento. Cuando lo hagamos, actualizaremos la fecha de &ldquo;última
          actualización&rdquo; en la parte superior de esta página.
        </LegalP>
        <LegalP>
          Si los cambios son materiales, te lo notificaremos por correo
          electrónico al menos 15 días antes de que entren en vigor. El uso
          continuado del Servicio después de dicha notificación constituye tu
          aceptación de los nuevos términos.
        </LegalP>
      </LegalSection>

      <LegalSection id="contacto" number={13} title="Contacto">
        <LegalP>
          Si tienes preguntas sobre estos términos o necesitas ejercer algún
          derecho reconocido en este documento, puedes contactarnos en:
        </LegalP>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2 text-sm">
          <p>
            <span className="font-semibold text-slate-800">Empresa:</span>{" "}
            Conexory SAS
          </p>
          <p>
            <span className="font-semibold text-slate-800">Correo:</span>{" "}
            <a
              href="mailto:legal@conexory.com"
              className="text-brand-500 hover:underline"
            >
              legal@conexory.com
            </a>
          </p>
          <p>
            <span className="font-semibold text-slate-800">Ciudad:</span>{" "}
            Bogotá D.C., Colombia
          </p>
        </div>
      </LegalSection>
    </LegalLayout>
  )
}
