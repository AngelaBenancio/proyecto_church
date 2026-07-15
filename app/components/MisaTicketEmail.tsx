import React from 'react';

interface MisaTicketEmailProps {
  nombreSolicitante: string;
  telefonoSolicitante: string;
  emailSolicitante: string;
  tipoCelebracion: string;
  tipoIntencion?: string;
  nombreIntencion?: string;
  fechaMisa: string;
  horaMisa: string;
  montoOfrenda: number;
  codigoOperacion: string;
  documentos?: string[];
}

export default function MisaTicketEmail({
  nombreSolicitante,
  telefonoSolicitante,
  emailSolicitante,
  tipoCelebracion,
  tipoIntencion = "",
  nombreIntencion = "",
  fechaMisa,
  horaMisa,
  montoOfrenda,
  codigoOperacion,
  documentos = [],
}: MisaTicketEmailProps) {
  // Traducir tipo de intención para visualización
  const getIntencionLabel = () => {
    switch (tipoIntencion) {
      case "DIFUNTO": return "Misa de Difunto (Q.E.P.D.)";
      case "SALUD": return "Misa por Salud y Recuperación";
      case "CUMPLEANOS": return "Misa de Cumpleaños";
      case "ACCION_GRACIAS": return "Acción de Gracias";
      default: return "Intención Comunitaria";
    }
  };

  return (
    <div style={{
      fontFamily: "sans-serif",
      backgroundColor: '#fafaf9',
      padding: '24px',
      color: '#2b2b2b',
      maxWidth: '600px',
      margin: '0 auto',
      border: '1px solid #eadcb9',
      borderRadius: '16px',
    }}>
      {/* Cabecera del Email */}
      <div style={{
        textAlign: 'center',
        borderBottom: '2px solid #eadcb9',
        paddingBottom: '20px',
        marginBottom: '24px',
      }}>
        {/* Cruz o Isotipo de la Parroquia */}
        <div style={{
          display: 'inline-block',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#80385e',
          color: '#ffffff',
          fontSize: '28px',
          fontWeight: 'bold',
          lineHeight: '56px',
          textAlign: 'center',
          marginBottom: '12px',
        }}>
          †
        </div>
        <h2 style={{
          margin: '0',
          fontSize: '18px',
          fontWeight: 'normal',
          color: '#5c3e35',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
        }}>
          Parroquia Nuestra Señora del Patrocinio
        </h2>
        <p style={{
          margin: '4px 0 0 0',
          fontSize: '13px',
          color: '#8c6b2f',
          fontStyle: 'italic',
        }}>
          "Bajo tu patrocinio acógenos Madre"
        </p>
      </div>

      {/* Título del Ticket */}
      <div style={{
        textAlign: 'center',
        marginBottom: '24px',
      }}>
        <h3 style={{
          margin: '0',
          fontSize: '20px',
          color: '#80385e',
          fontWeight: 'bold',
        }}>
          Ticket de Registro Litúrgico
        </h3>
        <p style={{
          margin: '6px 0 0 0',
          fontSize: '11px',
          color: '#718096',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          Estado: Pendiente de Confirmación de Pago
        </p>
      </div>

      {/* Resumen de la Solicitud */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {/* Fila: Servicio */}
            <tr>
              <td style={{ padding: '8px 0', fontSize: '12px', color: '#718096', width: '35%' }}>Celebración:</td>
              <td style={{ padding: '8px 0', fontSize: '13px', fontWeight: 'bold', color: '#2b2b2b' }}>
                {tipoCelebracion === "SACRAMENTO" ? "Sacramento Litúrgico" : getIntencionLabel()}
              </td>
            </tr>

            {/* Fila: Nombre Intención / Festejado */}
            {nombreIntencion && (
              <tr>
                <td style={{ padding: '8px 0', fontSize: '12px', color: '#718096' }}>Intención para:</td>
                <td style={{ padding: '8px 0', fontSize: '13px', fontWeight: 'bold', color: '#80385e' }}>
                  {nombreIntencion}
                </td>
              </tr>
            )}

            {/* Fila: Fecha */}
            <tr>
              <td style={{ padding: '8px 0', fontSize: '12px', color: '#718096' }}>Fecha Litúrgica:</td>
              <td style={{ padding: '8px 0', fontSize: '13px', fontWeight: 'bold', color: '#2b2b2b' }}>
                {fechaMisa}
              </td>
            </tr>

            {/* Fila: Hora */}
            <tr>
              <td style={{ padding: '8px 0', fontSize: '12px', color: '#718096' }}>Hora Agendada:</td>
              <td style={{ padding: '8px 0', fontSize: '13px', fontWeight: 'bold', color: '#2b2b2b' }}>
                {horaMisa}
              </td>
            </tr>

            {/* Fila: Solicitante */}
            <tr>
              <td style={{ padding: '8px 0', fontSize: '12px', color: '#718096', borderTop: '1px solid #edf2f7', paddingTop: '12px' }}>Solicitante:</td>
              <td style={{ padding: '8px 0', fontSize: '13px', fontWeight: 'bold', color: '#2b2b2b', borderTop: '1px solid #edf2f7', paddingTop: '12px' }}>
                {nombreSolicitante}
              </td>
            </tr>

            {/* Fila: Celular */}
            <tr>
              <td style={{ padding: '8px 0', fontSize: '12px', color: '#718096' }}>Celular:</td>
              <td style={{ padding: '8px 0', fontSize: '13px', color: '#2b2b2b' }}>
                {telefonoSolicitante}
              </td>
            </tr>

            {/* Fila: Correo */}
            <tr>
              <td style={{ padding: '8px 0', fontSize: '12px', color: '#718096' }}>Email:</td>
              <td style={{ padding: '8px 0', fontSize: '13px', color: '#2b2b2b' }}>
                {emailSolicitante}
              </td>
            </tr>

            {/* Fila: Ofrenda */}
            <tr>
              <td style={{ padding: '8px 0', fontSize: '12px', color: '#718096', borderTop: '1px solid #edf2f7', paddingTop: '12px' }}>Ofrenda Yape:</td>
              <td style={{ padding: '8px 0', fontSize: '14px', fontWeight: 'bold', color: '#e69526', borderTop: '1px solid #edf2f7', paddingTop: '12px' }}>
                S/. {montoOfrenda.toFixed(2)}
              </td>
            </tr>

            {/* Fila: Código de Operación */}
            <tr>
              <td style={{ padding: '8px 0', fontSize: '12px', color: '#718096' }}>Cód. Operación:</td>
              <td style={{ padding: '8px 0', fontSize: '13px', fontWeight: 'bold', color: '#2b2b2b', fontFamily: 'monospace' }}>
                #{codigoOperacion}
              </td>
            </tr>

            {/* Fila: Documentos */}
            {documentos.length > 0 && (
              <tr>
                <td style={{ padding: '8px 0', fontSize: '12px', color: '#718096', borderTop: '1px solid #edf2f7', paddingTop: '12px' }}>Documentos:</td>
                <td style={{ padding: '8px 0', fontSize: '11px', color: '#4a5568', borderTop: '1px solid #edf2f7', paddingTop: '12px' }}>
                  <ul style={{ margin: '0', paddingLeft: '16px' }}>
                    {documentos.map((doc, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{doc}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mensaje Informativo */}
      <div style={{
        fontSize: '11px',
        color: '#718096',
        lineHeight: '1.6',
        textAlign: 'center',
        padding: '0 12px',
        marginBottom: '24px',
      }}>
        Este es un comprobante de pre-registro. El despacho parroquial verificará el código de transacción de Yape en un plazo máximo de 24 horas laborables para confirmar formalmente tu solicitud.
      </div>

      {/* Pie de Página */}
      <div style={{
        textAlign: 'center',
        borderTop: '1px solid #eadcb9',
        paddingTop: '20px',
        fontSize: '11px',
        color: '#718096',
      }}>
        <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', color: '#5c3e35' }}>
          Secretaría Parroquial - Nuestra Señora del Patrocinio
        </p>
        <p style={{ margin: '0' }}>
          Si tienes alguna consulta, puedes escribirnos a <a href="mailto:contacto@parroquiapatrocinio.org" style={{ color: '#80385e', textDecoration: 'none' }}>contacto@parroquiapatrocinio.org</a>
        </p>
      </div>
    </div>
  );
}
