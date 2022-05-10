//Requerimiento 6) Envío de correos electrónicos
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "escribetucorreo@gmail.com",
    pass: "Acá va tu contraseña",
  },
});

const enviarCorreo = async (nombre, descripcion, monto, correos) => {
  let mailOptions = {
    from: "Desde que email vas a enviar el correo (línea 7)",
    to: ["a que correo quieres enviar la información",],
    subject: `Nuevo gasto agregado`,
    html: `Se ha registrado un nuevo gasto de ${nombre}. La descripción es: ${descripcion}, por un monto de $.${monto}`,
  };
  try {
    const result = await transporter.sendMail(mailOptions);
  } catch (e) {
    throw e;
  }
};

module.exports = { enviarCorreo };
