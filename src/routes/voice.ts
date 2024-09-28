import { FastifyPluginAsync } from "fastify";

import * as error from "../utils/error";

const voice: FastifyPluginAsync = async (app) => {
  app.get("/api/v1/config", async (req, res) => {
    const XML = `
    <VCConfiguration>
        <DefaultRealm>mtu1xp.vivox.com</DefaultRealm>
            <XMPPServer>
                <host>mtu1xp-mim.vivox.com</host>
                <port>443</port>
                <tls>true</tls>
            </XMPPServer>

            <WSXMPPServer>wss://vantage.lunarfn.org</WSXMPPServer>
                <DefaultWatson>https://cdp.vivox.com</DefaultWatson>
                <WatsonSampleRate>10</WatsonSampleRate>
                <DefaultDyson>https://cdp.vivox.com</DefaultDyson>
                <DysonSampleRate>10</DysonSampleRate>
                <DefaultEureka>https://watson.vivox.com</DefaultEureka>
                <EurekaSampleRate>10</EurekaSampleRate>
                <NeverRTPTimeout>15</NeverRTPTimeout>
                <LostRTPTimeout>40</LostRTPTimeout>
            <XmppPingIntervalSeconds>10</XmppPingIntervalSeconds>
        <MaxUserUriLength>146</MaxUserUriLength>
    </VCConfiguration>
    `;

    res.type("application/xml").send(XML);
  });

  app.setNotFoundHandler((req, res) => {
    const err = error.not_found(req);
    res.headers(err.header).status(404).send(err.error);
  });
};

export default voice;
