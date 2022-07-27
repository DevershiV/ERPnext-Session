from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in session_history/__init__.py
from session_history import __version__ as version

setup(
	name="session_history",
	version=version,
	description="Session history tracker module",
	author="Devershi",
	author_email="user@example.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
