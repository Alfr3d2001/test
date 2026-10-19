"""Theme behavior and responsive checks against the local static server."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page(color_scheme='dark', reduced_motion='reduce')
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto('http://127.0.0.1:8000/#home')
    switch = page.get_by_role('switch', name='Modo oscuro')
    assert switch.get_attribute('aria-checked') == 'true'
    assert page.evaluate('getComputedStyle(document.documentElement).colorScheme') == 'dark'
    page.emulate_media(color_scheme='light')
    assert switch.get_attribute('aria-checked') == 'false'
    switch.focus()
    switch.press('Space')
    assert switch.get_attribute('aria-checked') == 'true'
    page.reload()
    assert switch.get_attribute('aria-checked') == 'true'
    page.emulate_media(color_scheme='light')
    assert switch.get_attribute('aria-checked') == 'true'
    for theme in ['dark', 'light']:
        if page.evaluate('document.documentElement.dataset.theme') != theme:
            switch.click()
        for width in [360, 390, 768, 1440]:
            page.set_viewport_size({'width':width, 'height':900})
            for route in ['home','expedientes','tramite-1','tramite-2','tramite-3','confirmacion','ayuda','notificaciones','borradores','login']:
                page.goto('http://127.0.0.1:8000/#'+route)
                assert switch.is_visible()
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (theme,width,route)
        page.goto('http://127.0.0.1:8000/#home')
        page.screenshot(path=f'/tmp/facilgest-{theme}.png',full_page=True)
    # Denied browser storage must not prevent switching.
    restricted = browser.new_context(color_scheme='light')
    restricted.add_init_script("Object.defineProperty(window, 'localStorage', {get(){throw new Error('blocked')}})")
    other = restricted.new_page()
    other.goto('http://127.0.0.1:8000/')
    other.get_by_role('switch').click()
    assert other.get_by_role('switch').get_attribute('aria-checked') == 'true'
    assert not errors, errors
    browser.close()
    print('PASS: system theme, keyboard toggle, saved preference, 80 responsive theme/route combinations, blocked storage; no JS errors.')
