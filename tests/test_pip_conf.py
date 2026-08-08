import pathlib

def test_pip_conf_contains_trusted_hosts():
    pip_conf_path = pathlib.Path('pip.conf')
    assert pip_conf_path.is_file(), "pip.conf file should exist"
    content = pip_conf_path.read_text()
    # Ensure trusted-host entries are present
    assert 'trusted-host' in content
    assert 'pypi.org' in content
    assert 'files.pythonhosted.org' in content
