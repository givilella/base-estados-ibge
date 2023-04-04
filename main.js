import fs from 'fs/promises';
import axios from 'axios';

const criarEstadoDTO = ({ id, nome, sigla }) => {
  return {
    codigo: Number(id),
    sigla,
    nome,
    cidades: [],
  };
};

const criarMunicipioDTO = ({ id, nome }) => {
  return {
    codigo: Number(id),
    nome,
  };
};

const config = {
  ESTADOS_URL:
    'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome',
  GET_MUNICIPIOS_URL: (cod_estado) =>
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${cod_estado}/municipios`,
};

async function getEstados(ESTADOS_URL) {
  const res = await axios.get(ESTADOS_URL);
  return res.data;
}

async function getMunicipiosPorEstado(MUNICIPIOS_URL) {
  const res = await axios.get(MUNICIPIOS_URL);
  return res.data;
}

async function main() {
  const estados = await getEstados(config.ESTADOS_URL);
  const objetosEstado = [];

  for (const estado of estados) {
    try {
      const MUNICIPIOS_URL = config.GET_MUNICIPIOS_URL(estado.id);
      const municipios = await getMunicipiosPorEstado(MUNICIPIOS_URL);

      const objetoEstado = criarEstadoDTO(estado);
      objetoEstado.cidades = municipios.map((municipio) =>
        criarMunicipioDTO(municipio)
      );

      await fs.writeFile(
        `./estados/${estado.sigla}.json`,
        JSON.stringify(objetoEstado)
      );
      objetosEstado.push(objetoEstado);
    } catch (error) {
      console.log(estado.sigla, error);
    }
  }

  await fs.writeFile(`./estados.json`, JSON.stringify(objetosEstado));
}

main();
