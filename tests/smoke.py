"""Run against the static server: python tests/smoke.py."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page(viewport={'width':1440,'height':1000}, reduced_motion='reduce')
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto('http://127.0.0.1:8000/')
    page.locator('#btnEntrar').click()
    assert page.locator('.notificacion').is_visible()
    page.locator('#dni').fill('Alex')
    page.locator('#pin').fill('1234')
    page.locator('#pin').press('Enter')
    page.wait_for_url('**/#home')
    assert page.locator('.screen.active').count() == 1
    assert page.locator('.hello').inner_text() == 'Hola, Alex'
    page.screenshot(path='/tmp/facilgest-desktop.png', full_page=True)
    page.goto('http://127.0.0.1:8000/#expedientes')
    page.locator('#q').fill('001234')
    page.locator('#filtro').select_option('Resuelto')
    assert page.locator('#expedientes .item:visible').count() == 0
    assert 'No encontramos' in page.locator('#resultados').inner_text()
    page.locator('#filtro').select_option('Todos')
    assert page.locator('#expedientes .item:visible').count() == 1
    page.goto('http://127.0.0.1:8000/#tramite-1')
    page.locator('#motivo').fill('   ')
    page.locator('#btnContinuar1').click()
    assert page.url.endswith('#tramite-1')
    page.locator('#motivo').fill('Certificado de prueba')
    page.locator('#btnContinuar1').click()
    page.wait_for_url('**/#tramite-2')
    page.locator('#btnContinuar2').click()
    page.wait_for_url('**/#tramite-3')
    assert page.locator('#resumenTramite').inner_text() == 'Solicitud de certificado'
    assert page.locator('#resumenDocumento').inner_text() == 'Sin documento'
    page.locator('#btnBorrador3').click()
    page.wait_for_url('**/#borradores')
    page.reload()
    page.locator('#borradorActivo').click()
    page.wait_for_url('**/#tramite-3')
    assert page.locator('#motivo').input_value() == 'Certificado de prueba'
    page.locator('#btnEnviar').click()
    page.wait_for_url('**/#confirmacion')
    assert page.locator('#registroCodigo').inner_text().startswith('DEMO-')
    assert page.evaluate("localStorage.getItem('facilgest_borradores')") is None
    page.goto('http://127.0.0.1:8000/#ayuda')
    page.locator('#ayuda [data-logout]').click()
    page.wait_for_url('**/#login')
    assert page.evaluate("localStorage.getItem('facilgest_usuario')") is None
    page.evaluate("""localStorage.setItem('facilgest_borradores', JSON.stringify({solicitud_activa:{tipo:'<img src=x onerror=alert(1)>', paso:1}}))""")
    page.goto('http://127.0.0.1:8000/#borradores')
    page.reload()
    assert page.locator('#borradores img').count() == 0
    assert '<img' in page.locator('#borradorActivo').inner_text()
    page.evaluate("localStorage.setItem('facilgest_borradores', 'invalid json')")
    page.reload()
    assert page.locator('#borradores').is_visible()
    for width in [360,390,768,1440]:
        page.set_viewport_size({'width':width,'height':900})
        for route in ['home','expedientes','tramite-1','tramite-3','login']:
            page.goto('http://127.0.0.1:8000/#'+route)
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width,route)
    page.set_viewport_size({'width':390,'height':844})
    page.goto('http://127.0.0.1:8000/#home')
    page.screenshot(path='/tmp/facilgest-mobile.png',full_page=True)
    assert not errors, errors
    browser.close()
    print('PASS: login/logout, combined filters, validation, summary, draft step 3, submission, corrupt storage, 20 responsive layouts; no JS errors.')
