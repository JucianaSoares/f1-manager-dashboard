import Fastify from 'fastify';
import fs from 'node:fs';
import cors from '@fastify/cors';

const app = Fastify();

await app.register(cors, { 
  
  origin: [
    'http://localhost:5174',       
    'https://f1-manager-dashboard.vercel.app' 
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
});

// Tipagens
interface Equipe {
  id: number;
  nome: string;
  base: string;
  motor: string;
}

interface Piloto {
  id: number;
  nome: string;
  equipe: string;
  pais: string;
}

// Carrega os dados dos arquivos JSON assim que o script é lido
let pilotos: Piloto[] = JSON.parse(fs.readFileSync('pilotos.json', 'utf-8'));
let equipes: Equipe[] = JSON.parse(fs.readFileSync('equipes.json', 'utf-8'));

// ==========================================
// --- SCHEMAS DE VALIDAÇÃO (FASTIFY) ---
// ==========================================

const equipeSchema = {
  body: {
    type: 'object',
    required: ['nome', 'base', 'motor'],
    properties: {
      nome: { type: 'string', minLength: 2 },
      base: { type: 'string', minLength: 2 },
      motor: { type: 'string', minLength: 2 }
    }
  }
};

const pilotoSchema = {
  body: {
    type: 'object',
    required: ['nome', 'equipe', 'pais'],
    properties: {
      nome: { type: 'string', minLength: 2 },
      equipe: { type: 'string', minLength: 2 },
      pais: { type: 'string', minLength: 2 }
    }
  }
};


// ==========================================
// --- ROTAS DE EQUIPES ---
// ==========================================

// Listar todas as equipes
app.get('/equipes', async () => {
  return equipes;
});

// Buscar equipe por ID
app.get('/equipes/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const equipe = equipes.find(e => e.id === Number(id));

  if (!equipe) {
    return reply.status(404).send({ erro: "Equipe não encontrada." });
  }

  return equipe;
});

// Buscar equipe por nome
app.get('/equipes/nome/:nome', async (request, reply) => {
  const { nome } = request.params as { nome: string };
  const equipe = equipes.find(e => e.nome.toLowerCase() === nome.toLowerCase());

  if (!equipe) {
    return reply.status(404).send({ erro: "Equipe não encontrada." });
  }

  return equipe;
});

// Cadastrar uma única equipe
app.post('/equipes', { schema: equipeSchema }, async (request, reply) => {
  const novaEquipe = request.body as Omit<Equipe, 'id'>;
  const novoId = equipes.length > 0 ? equipes[equipes.length - 1].id + 1 : 1;

  const equipeCriada: Equipe = {
    id: novoId,
    ...novaEquipe
  };

  equipes.push(equipeCriada);
  fs.writeFileSync('equipes.json', JSON.stringify(equipes, null, 2));

  return reply.status(201).send(equipeCriada);
});

// Cadastrar equipes em lote
app.post('/equipes/lote', async (request, reply) => {
  const novasEquipes = request.body as any[];

  if (!Array.isArray(novasEquipes) || novasEquipes.length === 0) {
    return reply.status(400).send({ erro: "O corpo da requisição deve ser um array válido de equipes." });
  }

  let ultimoId = equipes.length > 0 ? equipes[equipes.length - 1].id : 0;

  const equipesAdicionadas = novasEquipes.map(e => {
    ultimoId++;
    return {
      id: ultimoId,
      nome: e.nome,
      base: e.base,
      motor: e.motor
    };
  });

  equipes.push(...equipesAdicionadas);
  fs.writeFileSync('equipes.json', JSON.stringify(equipes, null, 2));

  return reply.status(201).send({
    mensagem: `${equipesAdicionadas.length} equipes cadastradas com sucesso!`,
    equipes: equipesAdicionadas
  });
});

// Atualizar equipe por ID (PUT)
app.put('/equipes/:id', { schema: equipeSchema }, async (request, reply) => {
  const { id } = request.params as { id: string };
  const dadosAtualizados = request.body as Omit<Equipe, 'id'>;
  
  const index = equipes.findIndex(e => e.id === Number(id));

  if (index === -1) {
    return reply.status(404).send({ erro: "Equipe não encontrada." });
  }

  equipes[index] = {
    id: Number(id),
    ...dadosAtualizados
  };

  fs.writeFileSync('equipes.json', JSON.stringify(equipes, null, 2));

  return reply.send({
    mensagem: "Equipe atualizada com sucesso!",
    equipe: equipes[index]
  });
});

// Deletar equipe por ID (DELETE)
app.delete('/equipes/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const index = equipes.findIndex(e => e.id === Number(id));

  if (index === -1) {
    return reply.status(404).send({ erro: "Equipe não encontrada." });
  }

  const equipeRemovida = equipes.splice(index, 1);
  fs.writeFileSync('equipes.json', JSON.stringify(equipes, null, 2));

  return reply.send({
    mensagem: "Equipe removida com sucesso!",
    equipe: equipeRemovida[0]
  });
});


// ==========================================
// --- ROTAS DE PILOTOS ---
// ==========================================

// Listar todos os pilotos
app.get('/pilotos', async () => {
  return pilotos;
});

// Buscar piloto por ID
app.get('/pilotos/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const piloto = pilotos.find(p => p.id === Number(id));

  if (!piloto) {
    return reply.status(404).send({ erro: "Piloto não encontrado." });
  }

  return piloto;
});

// Buscar piloto por nome
app.get('/pilotos/nome/:nome', async (request, reply) => {
  const { nome } = request.params as { nome: string };
  const piloto = pilotos.find(p => p.nome.toLowerCase() === nome.toLowerCase());

  if (!piloto) {
    return reply.status(404).send({ erro: "Piloto não encontrado." });
  }

  return piloto;
});

// Cadastrar um único piloto
app.post('/pilotos', { schema: pilotoSchema }, async (request, reply) => {
  const novoPilotoData = request.body as Omit<Piloto, 'id'>;
  const novoId = pilotos.length > 0 ? pilotos[pilotos.length - 1].id + 1 : 1;

  const pilotoCriado: Piloto = {
    id: novoId,
    ...novoPilotoData
  };

  pilotos.push(pilotoCriado);
  fs.writeFileSync('pilotos.json', JSON.stringify(pilotos, null, 2));

  return reply.status(201).send(pilotoCriado);
});

// Cadastrar pilotos em lote
app.post('/pilotos/lote', async (request, reply) => {
  const novosPilotos = request.body as any[];

  if (!Array.isArray(novosPilotos) || novosPilotos.length === 0) {
    return reply.status(400).send({ erro: "O corpo da requisição deve ser um array válido de pilotos." });
  }

  let ultimoId = pilotos.length > 0 ? pilotos[pilotos.length - 1].id : 0;

  const pilotosAdicionados = novosPilotos.map(p => {
    ultimoId++;
    return {
      id: ultimoId,
      nome: p.nome,
      equipe: p.equipe,
      pais: p.pais
    };
  });

  pilotos.push(...pilotosAdicionados);
  fs.writeFileSync('pilotos.json', JSON.stringify(pilotos, null, 2));

  return reply.status(201).send({
    mensagem: `${pilotosAdicionados.length} pilotos cadastrados com sucesso!`,
    pilotos: pilotosAdicionados
  });
});

// Atualizar piloto por ID (PUT)
app.put('/pilotos/:id', { schema: pilotoSchema }, async (request, reply) => {
  const { id } = request.params as { id: string };
  const dadosAtualizados = request.body as Omit<Piloto, 'id'>;
  
  const index = pilotos.findIndex(p => p.id === Number(id));

  if (index === -1) {
    return reply.status(404).send({ erro: "Piloto não encontrado." });
  }

  pilotos[index] = {
    id: Number(id),
    ...dadosAtualizados
  };

  fs.writeFileSync('pilotos.json', JSON.stringify(pilotos, null, 2));

  return reply.send({
    mensagem: "Piloto atualizado com sucesso!",
    piloto: pilotos[index]
  });
});

// Deletar piloto por ID (DELETE)
app.delete('/pilotos/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const index = pilotos.findIndex(p => p.id === Number(id));

  if (index === -1) {
    return reply.status(404).send({ erro: "Piloto não encontrado." });
  }

  const pilotoRemovido = pilotos.splice(index, 1);
  fs.writeFileSync('pilotos.json', JSON.stringify(pilotos, null, 2));

  return reply.send({
    mensagem: "Piloto removido com sucesso!",
    piloto: pilotoRemovido[0]
  });
});


// ==========================================
// --- INICIALIZAÇÃO DO SERVIDOR ---
// ==========================================
const iniciar = async () => {
  try {
    await app.listen({ port: process.env.PORT ? Number(process.env.PORT) : 3000, 
  host: '0.0.0.0'  });
    console.log('Servidor rodando na porta 3000!');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

iniciar();
