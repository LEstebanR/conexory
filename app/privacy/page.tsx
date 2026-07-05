import type { Metadata } from "next"
import LegalLayout, {
  LegalSection,
  LegalP,
  LegalList,
  LegalSubtitle,
  LegalHighlight,
} from "@/components/legal-layout"

export const metadata: Metadata = {
  title: "Política de Privacidad — Conexory",
  description:
    "Política de tratamiento de datos personales de Conexory, en cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013.",
  robots: { index: false, follow: true },
}

const sections = [
  { id: "responsable", title: "Responsable del tratamiento" },
  { id: "datos-recopilados", title: "Datos que recopilamos" },
  { id: "finalidad", title: "Finalidad del tratamiento" },
  { id: "base-legal", title: "Base legal" },
  { id: "derechos", title: "Tus derechos (Habeas Data)" },
  { id: "compartir", title: "Compartir información" },
  { id: "seguridad", title: "Seguridad de datos" },
  { id: "cookies", title: "Cookies y tecnologías similares" },
  { id: "retencion", title: "Retención de datos" },
  { id: "transferencias", title: "Transferencias internacionales" },
  { id: "menores", title: "Menores de edad" },
  { id: "cambios", title: "Cambios a esta política" },
  { id: "contacto", title: "Contacto y ejercicio de derechos" },
]

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Política de Privacidad"
      description="Cómo recopilamos, usamos y protegemos tus datos personales, en cumplimiento de la Ley 1581 de 2012 (Habeas Data) y demás normas colombianas aplicables."
      lastUpdated="31 de mayo de 2026"
      sections={sections}
    >
      <LegalHighlight>
        En Conexory creemos que tus datos son tuyos. Solo recopilamos lo
        estrictamente necesario para operar el servicio, nunca los vendemos a
        terceros, y te damos control total sobre ellos.
      </LegalHighlight>

      <div className="mb-12" />

      <LegalSection id="responsable" number={1} title="Responsable del tratamiento">
        <LegalP>
          El responsable del tratamiento de tus datos personales es:
        </LegalP>
        <div className="bg-canvas-softer border border-hairline-strong rounded-xl p-5 space-y-2 text-sm">
          <p>
            <span className="font-semibold text-ink">Razón social:</span>{" "}
            Conexory SAS
          </p>
          <p>
            <span className="font-semibold text-ink">NIT:</span> En
            proceso de registro
          </p>
          <p>
            <span className="font-semibold text-ink">Domicilio:</span>{" "}
            Bogotá D.C., Colombia
          </p>
          <p>
            <span className="font-semibold text-ink">
              Correo para datos personales:
            </span>{" "}
            <a
              href="mailto:Conexory@gmail.com"
              className="text-ink hover:underline"
            >
              Conexory@gmail.com
            </a>
          </p>
        </div>
      </LegalSection>

      <LegalSection id="datos-recopilados" number={2} title="Datos que recopilamos">
        <LegalSubtitle>Datos que nos proporcionas directamente</LegalSubtitle>
        <LegalList
          items={[
            "Nombre completo y foto de perfil.",
            "Correo electrónico y número de WhatsApp.",
            "Ciudad o región de operación.",
            "Fotos, descripciones y precios de las propiedades que publicas.",
            "Información de pago (procesada por terceros certificados; no almacenamos datos de tarjetas).",
          ]}
        />
        <LegalSubtitle>Datos que recopilamos automáticamente</LegalSubtitle>
        <LegalList
          items={[
            "Dirección IP y datos aproximados de ubicación geográfica.",
            "Tipo de dispositivo, sistema operativo y navegador.",
            "Páginas visitadas dentro de la plataforma y acciones realizadas.",
            "Fecha y hora de acceso.",
            "Cookies y tecnologías similares (ver sección 8).",
          ]}
        />
        <LegalSubtitle>Datos de terceros</LegalSubtitle>
        <LegalP>
          Si te registras con Google, recibimos de dicha plataforma tu nombre,
          correo electrónico y foto de perfil, de acuerdo con los permisos que
          otorgas en el momento de la autenticación.
        </LegalP>
      </LegalSection>

      <LegalSection id="finalidad" number={3} title="Finalidad del tratamiento">
        <LegalP>
          Usamos tus datos únicamente para los siguientes fines:
        </LegalP>
        <LegalList
          items={[
            "Crear y gestionar tu cuenta de usuario en Conexory.",
            "Operar el servicio: almacenar y mostrar tus propiedades.",
            "Generar los links únicos de cada propiedad para que los compartas.",
            "Enviarte notificaciones del servicio, como confirmaciones de registro o alertas de seguridad.",
            "Mejorar la plataforma mediante análisis de uso agregado y anonimizado.",
            "Cumplir con obligaciones legales y requerimientos de autoridades colombianas.",
            "Enviarte comunicaciones de marketing si has dado tu consentimiento expreso (puedes revocarlos cuando quieras).",
          ]}
        />
        <LegalHighlight>
          Nunca usamos tus datos para fines distintos a los aquí descritos sin
          tu consentimiento previo y explícito.
        </LegalHighlight>
      </LegalSection>

      <LegalSection id="base-legal" number={4} title="Base legal">
        <LegalP>
          El tratamiento de tus datos se fundamenta en las siguientes bases
          legales, de conformidad con la Ley 1581 de 2012 y el Decreto 1377 de
          2013:
        </LegalP>
        <LegalList
          items={[
            "Consentimiento explícito: otorgado al aceptar estos términos al crear tu cuenta.",
            "Ejecución del contrato: el tratamiento es necesario para prestarte el servicio contratado.",
            "Cumplimiento de obligaciones legales: cuando la ley colombiana nos lo exige.",
            "Interés legítimo: para la seguridad de la plataforma y la prevención de fraudes.",
          ]}
        />
      </LegalSection>

      <LegalSection id="derechos" number={5} title="Tus derechos (Habeas Data)">
        <LegalP>
          En virtud de la Ley 1581 de 2012, tienes los siguientes derechos sobre
          tus datos personales:
        </LegalP>
        <LegalList
          items={[
            "Acceso: conocer los datos personales que tenemos sobre ti y el tratamiento que les damos.",
            "Rectificación: solicitar la corrección de datos inexactos, incompletos o desactualizados.",
            "Supresión: pedir que eliminemos tus datos cuando ya no sean necesarios para los fines indicados.",
            "Revocación del consentimiento: retirar tu autorización para el tratamiento de datos en cualquier momento.",
            "Queja: presentar una reclamación ante la Superintendencia de Industria y Comercio (SIC) si consideras que hemos vulnerado tus derechos.",
            "Portabilidad: recibir una copia de tus datos en formato estructurado y de uso común.",
          ]}
        />
        <LegalP>
          Para ejercer cualquiera de estos derechos, escríbenos a{" "}
          <a
            href="mailto:Conexory@gmail.com"
            className="text-ink font-semibold hover:underline"
          >
            Conexory@gmail.com
          </a>
          . Responderemos en un plazo máximo de diez (10) días hábiles, según lo
          establece la Ley 1581 de 2012.
        </LegalP>
      </LegalSection>

      <LegalSection id="compartir" number={6} title="Compartir información">
        <LegalP>
          <strong className="text-ink">No vendemos tus datos personales.</strong>{" "}
          Solo los compartimos en los siguientes casos limitados:
        </LegalP>
        <LegalSubtitle>Proveedores de servicios tecnológicos</LegalSubtitle>
        <LegalList
          items={[
            "Servicios de alojamiento y base de datos (e.g., Vercel, Neon).",
            "Pasarelas de pago certificadas.",
            "Servicios de autenticación (e.g., Google OAuth).",
            "Herramientas de análisis de uso, en formato anonimizado.",
          ]}
        />
        <LegalP>
          Todos nuestros proveedores están contractualmente obligados a proteger
          tus datos y a usarlos solo para prestar los servicios que les hemos
          contratado.
        </LegalP>
        <LegalSubtitle>Obligación legal</LegalSubtitle>
        <LegalP>
          Podemos divulgar tus datos si así lo exige una orden judicial, una
          autoridad competente colombiana o una norma legal vigente.
        </LegalP>
      </LegalSection>

      <LegalSection id="seguridad" number={7} title="Seguridad de datos">
        <LegalP>
          Implementamos medidas técnicas y organizativas razonables para proteger
          tus datos contra acceso no autorizado, pérdida, alteración o
          divulgación, incluyendo:
        </LegalP>
        <LegalList
          items={[
            "Comunicaciones cifradas mediante HTTPS/TLS.",
            "Contraseñas almacenadas con hash seguro (bcrypt o similar).",
            "Control de acceso basado en roles dentro del equipo de Conexory.",
            "Auditorías periódicas de seguridad.",
            "Copias de seguridad cifradas de la base de datos.",
          ]}
        />
        <LegalP>
          En caso de una brecha de seguridad que afecte tus datos, te
          notificaremos en el menor tiempo posible y tomaremos las medidas
          correctivas necesarias, conforme a la ley colombiana.
        </LegalP>
      </LegalSection>

      <LegalSection id="cookies" number={8} title="Cookies y tecnologías similares">
        <LegalP>
          Usamos cookies y tecnologías similares para operar la plataforma y
          mejorar tu experiencia:
        </LegalP>
        <LegalList
          items={[
            "Cookies esenciales: necesarias para la autenticación y el funcionamiento básico del servicio. No pueden desactivarse.",
            "Cookies de análisis: nos ayudan a entender cómo usas la plataforma (datos anonimizados). Puedes desactivarlas.",
            "Cookies de preferencias: recuerdan tus configuraciones (idioma, vista preferida, etc.).",
          ]}
        />
        <LegalP>
          Puedes gestionar o eliminar las cookies desde la configuración de tu
          navegador. Ten en cuenta que desactivar ciertas cookies puede afectar
          el funcionamiento de algunas funciones de la plataforma.
        </LegalP>
      </LegalSection>

      <LegalSection id="retencion" number={9} title="Retención de datos">
        <LegalP>
          Conservamos tus datos personales mientras tengas una cuenta activa en
          Conexory. Una vez elimines tu cuenta:
        </LegalP>
        <LegalList
          items={[
            "Tus datos de perfil y propiedades se eliminan en un plazo de 30 días.",
            "Los registros de transacciones se conservan hasta 5 años por obligación tributaria y contable colombiana.",
            "Los datos anonimizados de uso de la plataforma pueden conservarse indefinidamente para análisis estadísticos.",
          ]}
        />
      </LegalSection>

      <LegalSection id="transferencias" number={10} title="Transferencias internacionales">
        <LegalP>
          Algunos de nuestros proveedores tecnológicos operan fuera de Colombia.
          Cuando transferimos datos a otros países, nos aseguramos de que cuenten
          con niveles adecuados de protección, de conformidad con la Ley 1581 de
          2012 y las instrucciones de la Superintendencia de Industria y
          Comercio.
        </LegalP>
        <LegalP>
          Los países receptores o proveedores incluyen principalmente
          Estados Unidos (servicios de nube). Estos proveedores cuentan con
          certificaciones reconocidas de protección de datos (como Privacy
          Shield o cláusulas contractuales estándar).
        </LegalP>
      </LegalSection>

      <LegalSection id="menores" number={11} title="Menores de edad">
        <LegalP>
          El Servicio está dirigido exclusivamente a personas mayores de 18 años
          con capacidad legal para ejercer como asesores inmobiliarios. No
          recopilamos intencionalmente datos de menores de edad. Si detectamos
          que un usuario es menor de edad, eliminaremos su cuenta y datos de
          inmediato.
        </LegalP>
        <LegalP>
          Si eres padre, madre o tutor y crees que tu hijo ha creado una cuenta
          en Conexory, contáctanos en{" "}
          <a
            href="mailto:Conexory@gmail.com"
            className="text-ink font-semibold hover:underline"
          >
            Conexory@gmail.com
          </a>{" "}
          para proceder a la eliminación inmediata de sus datos.
        </LegalP>
      </LegalSection>

      <LegalSection id="cambios" number={12} title="Cambios a esta política">
        <LegalP>
          Podemos actualizar esta Política de Privacidad periódicamente para
          reflejar cambios en nuestras prácticas o en la legislación colombiana
          aplicable. La fecha de &ldquo;última actualización&rdquo; en la parte
          superior de esta página siempre reflejará la versión vigente.
        </LegalP>
        <LegalP>
          Cuando los cambios sean sustanciales, te notificaremos por correo
          electrónico con al menos 15 días de anticipación. Tu uso continuado del
          Servicio tras dicha notificación implica la aceptación de la nueva
          política.
        </LegalP>
      </LegalSection>

      <LegalSection id="contacto" number={13} title="Contacto y ejercicio de derechos">
        <LegalP>
          Para ejercer tus derechos de Habeas Data, presentar reclamaciones o
          resolver dudas sobre esta política, contáctanos:
        </LegalP>
        <div className="bg-canvas-softer border border-hairline-strong rounded-xl p-5 space-y-2 text-sm">
          <p>
            <span className="font-semibold text-ink">
              Área de protección de datos:
            </span>{" "}
            Conexory SAS
          </p>
          <p>
            <span className="font-semibold text-ink">Correo:</span>{" "}
            <a
              href="mailto:Conexory@gmail.com"
              className="text-ink hover:underline"
            >
              Conexory@gmail.com
            </a>
          </p>
          <p>
            <span className="font-semibold text-ink">Ciudad:</span>{" "}
            Bogotá D.C., Colombia
          </p>
          <p>
            <span className="font-semibold text-ink">
              Tiempo de respuesta:
            </span>{" "}
            10 días hábiles (Ley 1581/2012)
          </p>
        </div>
        <LegalP>
          También puedes presentar una queja ante la{" "}
          <strong className="text-ink">
            Superintendencia de Industria y Comercio (SIC)
          </strong>
          , la autoridad de protección de datos en Colombia, a través de{" "}
          <a
            href="https://www.sic.gov.co"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink font-semibold hover:underline"
          >
            www.sic.gov.co
          </a>
          .
        </LegalP>
      </LegalSection>
    </LegalLayout>
  )
}
