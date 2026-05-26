import config from '../configs/common.config';
const appName = config.APP_NAME;
const emailHead = config.SERVER_URL + '/public/images/ehead.png';
const emailFooter = config.SERVER_URL + '/public/images/envelope.png';

export const registerMail = ({ name, otp }: { name: string; otp: string }) => {
  return `
    <div
      style="
        margin: 0;
        padding: 0;
        font-family: Lato, Tahoma, Verdana, Segoe, sans-serif;
        font-size: 14px;
      "
    >
      <table
        cellspacing="0"
        cellpadding="0"
        width="100%"
        bgcolor="#EEEEEE"
        style="vertical-align: top; border-collapse: collapse"
      >
        <tbody>
          <tr style="vertical-align: top; border-collapse: collapse">
            <td
              align="center"
              valign="top"
              style="vertical-align: top; border-collapse: collapse"
            >
              <div
                style="
                  min-width: 320px;    
                  max-width: 600px;
                  width: 100%;
                  margin: 0 auto;
                "
              >
                <div style="padding: 0">
                  <a href="#"
                    ><img
                      align="center"
                      border="0"
                      src="${emailHead}"
                      alt=""
                      title=""
                      style="max-width: 525px; width: 87.5%; margin: 10px auto 0"
                      class="CToWUd"
                  /></a>
                </div>
                <div
                  style="
                    background: #fff;
                    overflow: hidden;
                    padding: 0;
                    max-width: 525px;
                    width: 87.5%;
                    text-align: left;
                  "
                >
                  <div style="padding: 0 15px; margin-bottom: 15px">
                    <div
                      style="
                        font-size: 18px;
                        margin: 0 0 5px;
                        display: block;
                        color: #000;
                        text-decoration: none;
                        text-align: center;
                      "
                    >
                      <b>Hi ${name}!</b><br /><br />
                      Thank you for creating an account with ${appName}.
                      <br /><br />
                      To access your account, we need you to finalize the
                      verification process.
                      <br /><br />
                      Your authentication code is: ${otp}
                    </div>
                  </div>
                  <div
                    style="
                      color: #000;
                      display: block;
                      margin: 10px 0;
                      font-size: 15px;
                      text-align: center;
                      text-decoration: none;
                    "
                  >
                    Sincerely yours,<br />${appName} Team
                  </div>
                </div>
                <div style="max-width: 600px; margin-bottom: 10px">
                  <img
                    src="${emailFooter}"
                    alt=""
                    style="max-width: 100%"
                    class="CToWUd a6T"
                    tabindex="0"
                  />
                  <div
                    class="a6S"
                    dir="ltr"
                    style="opacity: 0.01; left: 1032px; top: 1949.25px"
                  >
                    <div
                      id=":27g"
                      class="T-I J-J5-Ji aQv T-I-ax7 L3 a5q"
                      role="button"
                      tabindex="0"
                      data-tooltip-class="a1V"
                    >
                      <div class="aSK J-J5-Ji aYr"></div>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
};

export const forgotPasswordMail = ({
  name,
  otp,
}: {
  name: string;
  otp: string;
}) => {
  return `
    <div
      style="
        margin: 0;
        padding: 0;
        font-family: Lato, Tahoma, Verdana, Segoe, sans-serif;
        font-size: 14px;
      "
    >
      <table
        cellspacing="0"
        cellpadding="0"
        width="100%"
        bgcolor="#EEEEEE"
        style="vertical-align: top; border-collapse: collapse"
      >
        <tbody>
          <tr style="vertical-align: top; border-collapse: collapse">
            <td
              align="center"
              valign="top"
              style="vertical-align: top; border-collapse: collapse"
            >
              <div
                style="
                  min-width: 320px;
                  max-width: 600px;
                  width: 100%;
                  margin: 0 auto;
                "
              >
                <div style="padding: 0">
                  <a href="#"
                    ><img
                      align="center"
                      border="0"
                      src="${emailHead}"
                      alt=""
                      title=""
                      style="max-width: 525px; width: 87.5%; margin: 10px auto 0"
                      class="CToWUd"
                  /></a>
                </div>
                <div
                  style="
                    background: #fff;
                    overflow: hidden;
                    padding: 0;
                    max-width: 525px;
                    width: 87.5%;
                    text-align: left;
                  "
                >
                  <div style="padding: 0 15px; margin-bottom: 15px">
                    <div
                      style="
                        font-size: 18px;
                        margin: 0 0 5px;
                        display: block;
                        color: #000;
                        text-decoration: none;
                        text-align: center;
                      "
                    >
                      <b>Hi ${name}!</b><br /><br />We've received a request to
                      reset your password. If you didn't make the request, just
                      ignore this email.<br />Your reset password authentication
                      code is: ${otp}<br /><br />If you have any questions or
                      trouble logging on please contact an app administrator.
                    </div>
                  </div>
                  <div
                    style="
                      color: #000;
                      display: block;
                      margin: 10px 0;
                      font-size: 15px;
                      text-align: center;
                      text-decoration: none;
                    "
                  >
                    Sincerely yours,<br />${appName} Team
                  </div>
                </div>
                <div style="max-width: 600px; margin-bottom: 10px">
                  <img
                    src="${emailFooter}"
                    alt=""
                    style="max-width: 100%"
                    class="CToWUd a6T"
                    tabindex="0"
                  />
                  <div
                    class="a6S"
                    dir="ltr"
                    style="opacity: 0.01; left: 1032px; top: 1949.25px"
                  >
                    <div
                      id=":27g"
                      class="T-I J-J5-Ji aQv T-I-ax7 L3 a5q"
                      role="button"
                      tabindex="0"
                      data-tooltip-class="a1V"
                    >
                      <div class="aSK J-J5-Ji aYr"></div>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
};

export interface ContactUsArgs {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const contactUsMail = ({
  name,
  email,
  subject,
  message,
}: ContactUsArgs) => {
  return `
    <div
      style="
        margin: 0;
        padding: 0;
        font-family: Lato, Tahoma, Verdana, Segoe, sans-serif;
        font-size: 14px;
      "
    >
      <table
        cellspacing="0"
        cellpadding="0"
        width="100%"
        bgcolor="#EEEEEE"
        style="vertical-align: top; border-collapse: collapse"
      >
        <tbody>
          <tr style="vertical-align: top; border-collapse: collapse">
            <td
              align="center"
              valign="top"
              style="vertical-align: top; border-collapse: collapse"
            >
              <div
                style="
                  min-width: 320px;
                  max-width: 600px;
                  width: 100%;
                  margin: 0 auto;
                "
              >
                <div style="padding: 0">
                  <a href="#">
                    <img
                      align="center"
                      border="0"
                      src="${emailHead}"
                      alt="Email Header"
                      style="
                        max-width: 525px;
                        width: 87.5%;
                        margin: 10px auto 0;
                        display: block;
                      "
                      class="CToWUd"
                    />
                  </a>
                </div>
                <div
                  style="
                    background: #fff;
                    overflow: hidden;
                    padding: 20px 15px;
                    max-width: 525px;
                    width: 87.5%;
                    text-align: left;
                    box-sizing: border-box;
                  "
                >
                  <div
                    style="
                      font-size: 20px;
                      font-weight: bold;
                      color: #000;
                      text-align: center;
                      margin-bottom: 20px;
                    "
                  >
                    User Information
                  </div>

                  <table
                    cellspacing="0"
                    cellpadding="6"
                    style="width: 100%; font-size: 15px; color: #000"
                  >
                    <tr>
                      <td
                        style="
                          font-weight: bold;
                          white-space: nowrap;
                          vertical-align: top;
                          width: 40%;
                        "
                      >
                        Name :
                      </td>
                      <td style="vertical-align: top">${name}</td>
                    </tr>
                    <tr>
                      <td
                        style="
                          font-weight: bold;
                          white-space: nowrap;
                          vertical-align: top;
                        "
                      >
                        Email :
                      </td>
                      <td style="vertical-align: top">${email}</td>
                    </tr>
                    <tr>
                      <td
                        style="
                          font-weight: bold;
                          white-space: nowrap;
                          vertical-align: top;
                        "
                      >
                        Subject :
                      </td>
                      <td style="vertical-align: top">${subject}</td>
                    </tr>
                    <tr>
                      <td
                        style="
                          font-weight: bold;
                          white-space: nowrap;
                          vertical-align: top;
                        "
                      >
                        Message :
                      </td>
                      <td style="vertical-align: top">${message}</td>
                    </tr>
                  </table>

                  <div
                    style="
                      color: #000;
                      margin-top: 20px;
                      font-size: 15px;
                      text-align: center;
                    "
                  >
                    ${appName} Support Team
                  </div>
                </div>
                <div style="max-width: 600px; margin-bottom: 10px">
                  <img
                    src="${emailFooter}"
                    alt="Email footer"
                    style="max-width: 100%; display: block"
                    class="CToWUd a6T"
                    tabindex="0"
                  />
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
};
