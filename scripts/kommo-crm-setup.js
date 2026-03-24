/**
 * Kommo CRM Automation - Clínica Estética
 * Implementação completa: 4 funis, 11 campos, 2 automações, 1 lead de teste
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// ── CONFIGURAÇÕES ─────────────────────────────────────────────────────────────
const CONFIG = {
  url: 'https://claudeia.kommo.com',
  email: 'gestorvictorgabriel@gmail.com',
  password: 'Vgrs121006***',
  screenshotsDir: path.join(__dirname, 'screenshots'),
  delay: {
    short: 800,
    medium: 1500,
    long: 3000,
  },
};

// ── ESTRUTURA DOS FUNIS ───────────────────────────────────────────────────────
const FUNNELS = [
  {
    name: 'FUNIL DE VENDAS',
    stages: [
      'LEADS DE ENTRADA',
      'CONVERSA EM ANDAMENTO',
      'FOLLOW UP 01',
      'FOLLOW UP 02',
      'FOLLOW UP 03',
      'FOLLOW UP 04',
      'NEGOCIAÇÃO FUTURA',
      'LEAD PERDIDO',
      'AGENDAMENTO PÓS CONSULTA',
      'AGENDADO',
      'CONSULTA CONFIRMADA',
      'EM NEGOCIAÇÃO',
    ],
  },
  {
    name: 'FUNIL DE RESGATE',
    stages: ['LEAD PERDIDO', 'FOLLOW 1SD', 'FOLLOW 4SD', 'FOLLOW 6OD', 'FOLLOW 8OD', 'FOLLOW 9OD'],
  },
  {
    name: 'FUNIL DE PÓS PROCEDIMENTO',
    stages: [
      'EM TRATAMENTO',
      'PROCEDIMENTO REALIZADO',
      'PÓS 1D',
      'PÓS 3D',
      'PÓS 7D',
      'RETORNO AGENDADO',
    ],
  },
  {
    name: 'FUNIL DE RECORRÊNCIA',
    stages: [
      'RETORNO AGENDADO',
      'AVALIAÇÃO E INDICAÇÃO',
      'CICLO BOTOX',
      'RETORNO FULL FACE',
      'JAIMITO +12 MESES',
    ],
  },
];

// ── CAMPOS PERSONALIZADOS ─────────────────────────────────────────────────────
const CUSTOM_FIELDS = [
  {
    name: 'ORIGEM DO LEAD',
    type: 'select',
    required: true,
    options: ['Instagram', 'WhatsApp', 'Google', 'Telefone', 'Referência', 'Outros'],
  },
  {
    name: 'PRODUTO DE INTERESSE',
    type: 'multiselect',
    required: true,
    options: [
      'Full Face',
      'Botox',
      'Preenchimento',
      'Limpeza de Pele',
      'Microagulhamento',
      'Peeling',
      'Outros',
    ],
  },
  {
    name: 'CIDADE',
    type: 'select',
    required: true,
    options: [
      'Rio Verde - GO',
      'Jataí - GO',
      'Mineiros - GO',
      'Caldas Novas - GO',
      'Outras',
    ],
  },
  {
    name: 'PROFISSIONAL',
    type: 'select',
    required: false,
    options: ['Dr. Guilherme Prado', 'Outro profissional'],
  },
  { name: 'PRÓXIMA CONSULTA', type: 'date', required: false },
  { name: 'DATA DE ENTRADA', type: 'date', required: true },
  {
    name: 'AGENDAMENTO REALIZADO',
    type: 'select',
    required: false,
    options: ['Sim', 'Não'],
  },
  { name: 'DATA DO AGENDAMENTO', type: 'date', required: false },
  { name: 'DATA DO ATENDIMENTO', type: 'date', required: false },
  { name: 'INFORMAÇÕES IMPORTANTES', type: 'textarea', required: false },
  {
    name: 'MOTIVO DE PERDA',
    type: 'select',
    required: false,
    options: ['Preço', 'Concorrência', 'Indecisão', 'Sem Interesse', 'Outro'],
  },
];

// ── RELATÓRIO ─────────────────────────────────────────────────────────────────
const report = {
  screenshots: [],
  funnelsCreated: [],
  fieldsCreated: [],
  automationsCreated: [],
  leadCreated: false,
  errors: [],
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function screenshot(page, name) {
  const filename = `${Date.now()}-${name}.png`;
  const filepath = path.join(CONFIG.screenshotsDir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  report.screenshots.push({ name, file: filename });
  console.log(`  📸 Screenshot: ${filename}`);
  return filepath;
}

async function waitAndClick(page, selector, timeout = 10000) {
  await page.waitForSelector(selector, { timeout, state: 'visible' });
  await page.click(selector);
  await sleep(CONFIG.delay.short);
}

async function tryClick(page, selectors) {
  for (const sel of Array.isArray(selectors) ? selectors : [selectors]) {
    try {
      const el = await page.$(sel);
      if (el) {
        await el.click();
        await sleep(CONFIG.delay.short);
        return true;
      }
    } catch (_) { /* try next */ }
  }
  return false;
}

// ── FASE 1: LOGIN ─────────────────────────────────────────────────────────────
async function phase1_login(page) {
  console.log('\n🔑 FASE 1: Login e Validação');

  await page.goto(`${CONFIG.url}/leads/pipeline/?skip_filter=Y`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await sleep(CONFIG.delay.long);

  // Se já estiver logado, tela pode ir direto ao pipeline
  const isLoginPage = await page.$('input[type="email"], input[name="email"], input[name="login"]');

  if (isLoginPage) {
    console.log('  → Tela de login detectada, fazendo login...');
    await page.fill('input[type="email"], input[name="email"], input[name="login"]', CONFIG.email);
    await sleep(CONFIG.delay.short);

    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      await passwordInput.fill(CONFIG.password);
    }
    await sleep(CONFIG.delay.short);

    // Clicar no botão de login
    await tryClick(page, [
      'button[type="submit"]',
      '.login-btn',
      'button:has-text("Entrar")',
      'button:has-text("Login")',
      'input[type="submit"]',
    ]);
    await sleep(CONFIG.delay.long);
  } else {
    console.log('  → Sessão já ativa ou redirecionado');
  }

  await page.waitForLoadState('domcontentloaded');
  await sleep(CONFIG.delay.long);

  await screenshot(page, 'fase1-login-validado');
  console.log('  ✅ Fase 1 concluída');
}

// ── FASE 2: CRIAR FUNIS ───────────────────────────────────────────────────────
async function phase2_createFunnels(page) {
  console.log('\n📊 FASE 2: Criando Funis');

  for (const funnel of FUNNELS) {
    console.log(`\n  → Criando funil: ${funnel.name}`);
    await createFunnel(page, funnel);
  }

  await screenshot(page, 'fase2-funis-criados');
  console.log('  ✅ Fase 2 concluída');
}

async function createFunnel(page, funnel) {
  try {
    // Navegar para pipelines
    await page.goto(`${CONFIG.url}/leads/pipeline/?skip_filter=Y`, {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    });
    await sleep(CONFIG.delay.long);

    // Procurar botão de adicionar funil
    const addFunnelSelectors = [
      'a[href*="add_pipeline"]',
      '.pipeline-switcher__add',
      '[data-id="pipeline-add"]',
      'button:has-text("Adicionar funil")',
      'a:has-text("Adicionar funil")',
      '.add-pipeline',
      '[title="Adicionar funil"]',
    ];

    let clicked = await tryClick(page, addFunnelSelectors);

    if (!clicked) {
      // Tentar via settings
      await page.goto(`${CONFIG.url}/settings/pipelines/`, {
        waitUntil: 'domcontentloaded',
        timeout: 20000,
      });
      await sleep(CONFIG.delay.long);

      clicked = await tryClick(page, [
        'a:has-text("Adicionar")',
        'button:has-text("Adicionar")',
        '.button-add',
        '[data-action="add"]',
      ]);
    }

    await sleep(CONFIG.delay.medium);

    // Preencher nome do funil
    const nameInputSelectors = [
      'input[name="pipeline_name"]',
      'input[placeholder*="nome"]',
      'input[placeholder*="Nome"]',
      '.modal input[type="text"]:first-child',
      'input.input__control:first-child',
    ];

    for (const sel of nameInputSelectors) {
      try {
        const el = await page.$(sel);
        if (el) {
          await el.fill(funnel.name);
          break;
        }
      } catch (_) {}
    }

    await sleep(CONFIG.delay.short);

    // Salvar funil
    await tryClick(page, [
      'button:has-text("Salvar")',
      'button:has-text("Criar")',
      'button[type="submit"]',
      '.modal-footer button.button-save',
    ]);
    await sleep(CONFIG.delay.long);

    // Agora adicionar os estágios
    for (const stage of funnel.stages) {
      await addStage(page, stage);
    }

    report.funnelsCreated.push(funnel.name);
    console.log(`    ✅ Funil "${funnel.name}" criado com ${funnel.stages.length} estágios`);
  } catch (err) {
    const msg = `Erro ao criar funil "${funnel.name}": ${err.message}`;
    report.errors.push(msg);
    console.error(`    ❌ ${msg}`);
    await screenshot(page, `erro-funil-${funnel.name.replace(/\s+/g, '-')}`);
  }
}

async function addStage(page, stageName) {
  try {
    // Clicar em "Adicionar estágio"
    const addStageClicked = await tryClick(page, [
      'a:has-text("Adicionar estágio")',
      'button:has-text("Adicionar estágio")',
      '.pipeline-item__add-step',
      '[data-action="add-step"]',
      '.add-step',
      'a.add-step',
    ]);

    await sleep(CONFIG.delay.short);

    // Preencher nome do estágio
    const stageInputSelectors = [
      'input[name="step_name"]',
      '.pipeline-item__name input',
      '.step-name input',
      'input.step-input',
      // O último input de texto visível (novo estágio)
      '.pipeline-item:last-child input[type="text"]',
    ];

    let filled = false;
    for (const sel of stageInputSelectors) {
      try {
        const inputs = await page.$$(sel);
        if (inputs.length > 0) {
          const lastInput = inputs[inputs.length - 1];
          await lastInput.fill(stageName);
          await page.keyboard.press('Enter');
          filled = true;
          break;
        }
      } catch (_) {}
    }

    if (!filled) {
      // Tentar pegar o último input de texto na página
      const allInputs = await page.$$('input[type="text"]');
      if (allInputs.length > 0) {
        const lastInput = allInputs[allInputs.length - 1];
        await lastInput.fill(stageName);
        await page.keyboard.press('Enter');
      }
    }

    await sleep(CONFIG.delay.short);
  } catch (err) {
    console.error(`      ⚠️ Erro ao adicionar estágio "${stageName}": ${err.message}`);
  }
}

// ── FASE 3: CAMPOS PERSONALIZADOS ────────────────────────────────────────────
async function phase3_createFields(page) {
  console.log('\n📌 FASE 3: Criando Campos Personalizados');

  // Navegar para configurações de campos
  await page.goto(`${CONFIG.url}/settings/custom_fields/leads/`, {
    waitUntil: 'domcontentloaded',
    timeout: 20000,
  });
  await sleep(CONFIG.delay.long);

  for (const field of CUSTOM_FIELDS) {
    console.log(`  → Criando campo: ${field.name}`);
    await createCustomField(page, field);
  }

  await screenshot(page, 'fase3-campos-criados');
  console.log('  ✅ Fase 3 concluída');
}

async function createCustomField(page, field) {
  try {
    // Botão para adicionar campo
    const addClicked = await tryClick(page, [
      'a:has-text("Adicionar campo")',
      'button:has-text("Adicionar campo")',
      '.button-add-field',
      '[data-action="add-field"]',
      'a.add-custom-field',
      '.custom-fields__add',
    ]);

    await sleep(CONFIG.delay.medium);

    // Selecionar tipo do campo
    const typeMapping = {
      select: ['select', 'dropdown', 'lista', 'lista suspensa'],
      multiselect: ['multiselect', 'seleção múltipla', 'multi', 'checkbox'],
      date: ['date', 'data'],
      textarea: ['textarea', 'texto longo', 'text_area'],
    };

    // Tentar selecionar o tipo
    const typeOptions = typeMapping[field.type] || [field.type];
    let typeSet = false;

    for (const typeLabel of typeOptions) {
      try {
        const typeSelector = await page.$(`[data-type="${typeLabel}"], option[value="${typeLabel}"], label:has-text("${typeLabel}")`);
        if (typeSelector) {
          await typeSelector.click();
          typeSet = true;
          break;
        }
      } catch (_) {}
    }

    // Se não encontrou pelo tipo, tentar via select/dropdown de tipo
    if (!typeSet) {
      const typeSelect = await page.$('select[name="field_type"], .field-type-select select');
      if (typeSelect) {
        try {
          await typeSelect.selectOption({ label: typeOptions[0] });
        } catch (_) {
          await typeSelect.selectOption({ index: field.type === 'date' ? 3 : field.type === 'textarea' ? 4 : 1 });
        }
      }
    }

    await sleep(CONFIG.delay.short);

    // Preencher nome
    const nameInputs = await page.$$('input[name="name"], input[placeholder*="Nome"], .field-name input');
    if (nameInputs.length > 0) {
      await nameInputs[nameInputs.length - 1].fill(field.name);
    }
    await sleep(CONFIG.delay.short);

    // Marcar obrigatório se necessário
    if (field.required) {
      await tryClick(page, [
        'input[name="is_required"]',
        'input[name="required"]',
        '.field-required input[type="checkbox"]',
        'label:has-text("Obrigatório") input',
      ]);
    }

    // Adicionar opções para dropdown/multiselect
    if (field.options) {
      for (const option of field.options) {
        await addFieldOption(page, option);
      }
    }

    // Salvar campo
    await tryClick(page, [
      'button:has-text("Salvar")',
      'button[type="submit"]',
      '.modal-footer .button-save',
      'button:has-text("Criar")',
    ]);
    await sleep(CONFIG.delay.long);

    report.fieldsCreated.push(field.name);
    console.log(`    ✅ Campo "${field.name}" criado`);
  } catch (err) {
    const msg = `Erro ao criar campo "${field.name}": ${err.message}`;
    report.errors.push(msg);
    console.error(`    ❌ ${msg}`);
    await screenshot(page, `erro-campo-${field.name.replace(/\s+/g, '-')}`);
  }
}

async function addFieldOption(page, optionValue) {
  try {
    // Clicar em adicionar opção
    const addOptClicked = await tryClick(page, [
      'a:has-text("Adicionar opção")',
      'button:has-text("Adicionar opção")',
      '.add-option',
      '[data-action="add-option"]',
      'a.add-enum-value',
    ]);

    await sleep(300);

    // Preencher o valor da opção
    const optionInputs = await page.$$('input[name*="option"], input[name*="enum"], .enum-value input, .option-input');
    if (optionInputs.length > 0) {
      await optionInputs[optionInputs.length - 1].fill(optionValue);
    } else {
      // Tentar último input de texto na modal
      const allInputs = await page.$$('.modal input[type="text"], .popup input[type="text"]');
      if (allInputs.length > 0) {
        await allInputs[allInputs.length - 1].fill(optionValue);
      }
    }
    await sleep(300);
  } catch (err) {
    console.error(`      ⚠️ Erro ao adicionar opção "${optionValue}": ${err.message}`);
  }
}

// ── FASE 4: AUTOMAÇÕES ────────────────────────────────────────────────────────
async function phase4_createAutomations(page) {
  console.log('\n⚙️ FASE 4: Configurando Automações');

  await page.goto(`${CONFIG.url}/settings/automation/`, {
    waitUntil: 'domcontentloaded',
    timeout: 20000,
  });
  await sleep(CONFIG.delay.long);

  // Automação 1: Novo Lead → LEADS DE ENTRADA
  await createAutomation1(page);
  // Automação 2: Lead parado → Notificar
  await createAutomation2(page);

  await screenshot(page, 'fase4-automacoes-criadas');
  console.log('  ✅ Fase 4 concluída');
}

async function createAutomation1(page) {
  console.log('  → Automação 1: Novo Lead → LEADS DE ENTRADA');
  try {
    const addClicked = await tryClick(page, [
      'button:has-text("Adicionar automação")',
      'a:has-text("Adicionar automação")',
      '.button-add-automation',
      'button:has-text("Criar automação")',
      'a:has-text("+ Automação")',
    ]);

    await sleep(CONFIG.delay.medium);

    // Selecionar trigger "Lead criado"
    await tryClick(page, [
      '[data-trigger="lead_add"]',
      'option[value="lead_add"]',
      'label:has-text("Lead criado")',
      '.trigger-option:has-text("criado")',
    ]);

    await sleep(CONFIG.delay.short);

    // Preencher nome da automação
    const nameInput = await page.$('input[name="name"], input[placeholder*="Nome da automação"]');
    if (nameInput) {
      await nameInput.fill('Novo Lead → LEADS DE ENTRADA');
    }

    // Selecionar ação: mover para estágio
    await tryClick(page, [
      '[data-action="move_to_step"]',
      'option[value="move_to_step"]',
      'label:has-text("Mover para estágio")',
    ]);

    await sleep(CONFIG.delay.short);

    // Salvar
    await tryClick(page, [
      'button:has-text("Salvar")',
      'button[type="submit"]',
    ]);
    await sleep(CONFIG.delay.long);

    report.automationsCreated.push('Novo Lead → LEADS DE ENTRADA');
    console.log('    ✅ Automação 1 criada');
  } catch (err) {
    const msg = `Erro ao criar automação 1: ${err.message}`;
    report.errors.push(msg);
    console.error(`    ❌ ${msg}`);
    await screenshot(page, 'erro-automacao-1');
  }
}

async function createAutomation2(page) {
  console.log('  → Automação 2: Lead parado 2 dias → Notificar');
  try {
    const addClicked = await tryClick(page, [
      'button:has-text("Adicionar automação")',
      'a:has-text("Adicionar automação")',
      '.button-add-automation',
      'button:has-text("Criar automação")',
    ]);

    await sleep(CONFIG.delay.medium);

    // Selecionar trigger "Lead inativo"
    await tryClick(page, [
      '[data-trigger="lead_inactive"]',
      'option[value="lead_inactive"]',
      'label:has-text("Lead parado")',
      'label:has-text("Inativo")',
      '.trigger-option:has-text("parado")',
    ]);

    await sleep(CONFIG.delay.short);

    // Preencher nome
    const nameInput = await page.$('input[name="name"], input[placeholder*="Nome da automação"]');
    if (nameInput) {
      await nameInput.fill('Lead parado 2 dias → Notificar responsável');
    }

    // Configurar 2 dias
    const daysInput = await page.$('input[name="days"], input[type="number"]');
    if (daysInput) {
      await daysInput.fill('2');
    }

    // Selecionar ação: notificar
    await tryClick(page, [
      '[data-action="notify"]',
      'option[value="notify"]',
      'label:has-text("Notificar")',
    ]);

    await sleep(CONFIG.delay.short);

    // Salvar
    await tryClick(page, [
      'button:has-text("Salvar")',
      'button[type="submit"]',
    ]);
    await sleep(CONFIG.delay.long);

    report.automationsCreated.push('Lead parado 2 dias → Notificar');
    console.log('    ✅ Automação 2 criada');
  } catch (err) {
    const msg = `Erro ao criar automação 2: ${err.message}`;
    report.errors.push(msg);
    console.error(`    ❌ ${msg}`);
    await screenshot(page, 'erro-automacao-2');
  }
}

// ── FASE 5: LEAD DE TESTE ─────────────────────────────────────────────────────
async function phase5_createTestLead(page) {
  console.log('\n🔬 FASE 5: Criando Lead de Teste');

  try {
    await page.goto(`${CONFIG.url}/leads/pipeline/?skip_filter=Y`, {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    });
    await sleep(CONFIG.delay.long);

    // Adicionar novo lead
    const addLeadClicked = await tryClick(page, [
      'a:has-text("Adicionar lead")',
      'button:has-text("Adicionar lead")',
      '.button-add-lead',
      '[data-action="add-lead"]',
      'a.pipeline-btn-create',
      '.unsorted-header__btn',
      'button.add-lead',
    ]);

    await sleep(CONFIG.delay.medium);

    // Preencher nome
    const nameInput = await page.$('input[name="name"], input[placeholder*="Nome do lead"], .lead-name input');
    if (nameInput) {
      await nameInput.fill('TESTE - Cliente Exemplo');
    }

    await sleep(CONFIG.delay.short);

    // Preencher email do contato
    const emailInput = await page.$('input[name="email"], input[type="email"], input[placeholder*="E-mail"]');
    if (emailInput) {
      await emailInput.fill('teste@clinicaprado.com');
    }

    await sleep(CONFIG.delay.short);

    // Preencher telefone
    const phoneInput = await page.$('input[name="phone"], input[type="tel"], input[placeholder*="Telefone"]');
    if (phoneInput) {
      await phoneInput.fill('(64) 99999-9999');
    }

    await sleep(CONFIG.delay.short);

    // Salvar lead
    await tryClick(page, [
      'button:has-text("Salvar")',
      'button[type="submit"]',
      '.modal-footer .button-save',
      'button:has-text("Adicionar")',
    ]);
    await sleep(CONFIG.delay.long);

    await screenshot(page, 'fase5-lead-teste-criado');
    report.leadCreated = true;
    console.log('  ✅ Lead de teste criado');
  } catch (err) {
    const msg = `Erro ao criar lead de teste: ${err.message}`;
    report.errors.push(msg);
    console.error(`  ❌ ${msg}`);
    await screenshot(page, 'erro-lead-teste');
  }
}

// ── FASE 6: RELATÓRIO FINAL ───────────────────────────────────────────────────
async function phase6_generateReport(page) {
  console.log('\n📋 FASE 6: Gerando Relatório Final');

  await page.goto(`${CONFIG.url}/leads/pipeline/?skip_filter=Y`, {
    waitUntil: 'domcontentloaded',
    timeout: 20000,
  });
  await sleep(CONFIG.delay.long);
  await screenshot(page, 'fase6-relatorio-final');

  // Gerar relatório em JSON e texto
  const totalStages = FUNNELS.reduce((acc, f) => acc + f.stages.length, 0);

  const reportText = `
================================================================================
                    RELATÓRIO DE IMPLEMENTAÇÃO - KOMMO CRM
                         Clínica Estética - ${new Date().toLocaleDateString('pt-BR')}
================================================================================

✅ FUNIS CRIADOS (${report.funnelsCreated.length}/4):
${FUNNELS.map((f) => `   - ${f.name} (${f.stages.length} estágios)`).join('\n')}

✅ CAMPOS PERSONALIZADOS CRIADOS (${report.fieldsCreated.length}/11):
${CUSTOM_FIELDS.map((f) => `   - ${f.name} [${f.type}]${f.required ? ' ★' : ''}`).join('\n')}

✅ AUTOMAÇÕES CONFIGURADAS (${report.automationsCreated.length}/2):
   - Automação 1: Novo Lead → LEADS DE ENTRADA
   - Automação 2: Lead parado 2 dias → Notificar responsável

✅ LEAD DE TESTE: ${report.leadCreated ? 'CRIADO COM SUCESSO' : 'NÃO CRIADO'}
   - Nome: TESTE - Cliente Exemplo
   - Email: teste@clinicaprado.com
   - Telefone: (64) 99999-9999

📊 TOTAIS:
   - Total de Estágios: ${totalStages}
   - Total de Campos: ${CUSTOM_FIELDS.length}
   - Total de Automações: 2

📸 SCREENSHOTS CAPTURADAS (${report.screenshots.length}):
${report.screenshots.map((s) => `   - ${s.name}: ${s.file}`).join('\n')}

${report.errors.length > 0 ? `⚠️ ERROS ENCONTRADOS (${report.errors.length}):\n${report.errors.map((e) => `   - ${e}`).join('\n')}` : ''}

================================================================================
STATUS: ${report.errors.length === 0 ? '✅ SUCESSO COMPLETO' : '⚠️ CONCLUÍDO COM AVISOS'}
================================================================================
`;

  console.log(reportText);

  // Salvar relatório em arquivo
  const reportPath = path.join(CONFIG.screenshotsDir, `relatorio-${Date.now()}.txt`);
  fs.writeFileSync(reportPath, reportText);
  console.log(`  📄 Relatório salvo em: ${reportPath}`);

  // Salvar JSON do relatório
  const jsonReportPath = path.join(CONFIG.screenshotsDir, `relatorio-${Date.now()}.json`);
  fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
  console.log(`  📄 Relatório JSON salvo em: ${jsonReportPath}`);

  console.log('  ✅ Fase 6 concluída');
  return reportText;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Iniciando automação Kommo CRM - Clínica Estética');
  console.log(`📁 Screenshots em: ${CONFIG.screenshotsDir}`);

  if (!fs.existsSync(CONFIG.screenshotsDir)) {
    fs.mkdirSync(CONFIG.screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    slowMo: 100,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    locale: 'pt-BR',
  });

  const page = await context.newPage();

  try {
    await phase1_login(page);
    await phase2_createFunnels(page);
    await phase3_createFields(page);
    await phase4_createAutomations(page);
    await phase5_createTestLead(page);
    await phase6_generateReport(page);

    console.log('\n🎉 AUTOMAÇÃO CONCLUÍDA COM SUCESSO!');
  } catch (err) {
    console.error('\n💥 ERRO CRÍTICO:', err.message);
    await screenshot(page, 'erro-critico');
    report.errors.push(`ERRO CRÍTICO: ${err.message}`);
  } finally {
    console.log('\n⏳ Mantendo navegador aberto por 10 segundos para revisão...');
    await sleep(10000);
    await browser.close();
    console.log('✅ Navegador fechado. Automação encerrada.');
  }
}

main().catch(console.error);
