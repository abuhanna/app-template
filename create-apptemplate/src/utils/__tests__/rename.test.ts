import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { renameProject } from '../rename.js';
import type { ProjectConfig } from '../../types.js';

function createConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  return {
    projectPath: '/tmp/test',
    projectType: 'fullstack',
    backend: 'dotnet',
    architecture: 'clean',
    frontendFramework: 'vue',
    ui: 'vuetify',
    installDeps: false,
    placeInRoot: false,
    variant: 'full',
    ...overrides,
  };
}

describe('renameProject', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rename-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('does nothing when projectName is not set', async () => {
    const config = createConfig({ projectName: undefined });
    // Should not throw
    await renameProject(tmpDir, config);
  });

  describe('.NET rename', () => {
    function setupDotNetProject(baseDir: string) {
      // Create feature-arch-style structure: src/App.Template.Api/
      const srcDir = path.join(baseDir, 'src', 'App.Template.Api');
      fs.mkdirSync(srcDir, { recursive: true });
      fs.writeFileSync(
        path.join(srcDir, 'App.Template.Api.csproj'),
        '<Project><RootNamespace>App.Template.Api</RootNamespace></Project>'
      );
      fs.writeFileSync(
        path.join(srcDir, 'Program.cs'),
        'namespace App.Template.Api;\nclass Program { static void Main() { var x = new AppTemplate(); } }'
      );
      // Solution file
      fs.writeFileSync(
        path.join(baseDir, 'App.Template.sln'),
        'Project("App.Template.Api")\nEndProject'
      );
      // Test project
      const testDir = path.join(baseDir, 'tests', 'App.Template.Api.Tests');
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(
        path.join(testDir, 'App.Template.Api.Tests.csproj'),
        '<Project><RootNamespace>App.Template.Api.Tests</RootNamespace></Project>'
      );
    }

    it('renames .csproj files from App.Template to new name', async () => {
      const backendDir = path.join(tmpDir, 'backend');
      fs.mkdirSync(backendDir, { recursive: true });
      setupDotNetProject(backendDir);

      const config = createConfig({
        projectName: 'My.App',
        architecture: 'feature',
      });
      await renameProject(tmpDir, config);

      // .csproj should be renamed
      const srcDir = path.join(backendDir, 'src', 'My.App.Api');
      expect(fs.existsSync(path.join(srcDir, 'My.App.Api.csproj'))).toBe(true);
      expect(fs.existsSync(path.join(backendDir, 'src', 'App.Template.Api'))).toBe(false);
    });

    it('renames solution file', async () => {
      const backendDir = path.join(tmpDir, 'backend');
      fs.mkdirSync(backendDir, { recursive: true });
      setupDotNetProject(backendDir);

      const config = createConfig({
        projectName: 'My.App',
        architecture: 'feature',
      });
      await renameProject(tmpDir, config);

      expect(fs.existsSync(path.join(backendDir, 'My.App.sln'))).toBe(true);
      expect(fs.existsSync(path.join(backendDir, 'App.Template.sln'))).toBe(false);
    });

    it('replaces App.Template with new dot name in file contents', async () => {
      const backendDir = path.join(tmpDir, 'backend');
      fs.mkdirSync(backendDir, { recursive: true });
      setupDotNetProject(backendDir);

      const config = createConfig({
        projectName: 'My.App',
        architecture: 'feature',
      });
      await renameProject(tmpDir, config);

      const srcDir = path.join(backendDir, 'src', 'My.App.Api');
      const content = fs.readFileSync(path.join(srcDir, 'Program.cs'), 'utf-8');
      expect(content).toContain('My.App');
      expect(content).not.toContain('App.Template');
    });

    it('replaces AppTemplate with new namespace in file contents', async () => {
      const backendDir = path.join(tmpDir, 'backend');
      fs.mkdirSync(backendDir, { recursive: true });
      setupDotNetProject(backendDir);

      const config = createConfig({
        projectName: 'My.App',
        architecture: 'feature',
      });
      await renameProject(tmpDir, config);

      const srcDir = path.join(backendDir, 'src', 'My.App.Api');
      const content = fs.readFileSync(path.join(srcDir, 'Program.cs'), 'utf-8');
      expect(content).toContain('MyApp');
      expect(content).not.toContain('AppTemplate');
    });

    it('renames test project folder', async () => {
      const backendDir = path.join(tmpDir, 'backend');
      fs.mkdirSync(backendDir, { recursive: true });
      setupDotNetProject(backendDir);

      const config = createConfig({
        projectName: 'My.App',
        architecture: 'feature',
      });
      await renameProject(tmpDir, config);

      expect(fs.existsSync(path.join(backendDir, 'tests', 'My.App.Api.Tests'))).toBe(true);
      expect(fs.existsSync(path.join(backendDir, 'tests', 'App.Template.Api.Tests'))).toBe(false);
    });
  });

  describe('Spring rename', () => {
    function setupSpringProject(baseDir: string) {
      // Feature/NLayer style: src/main/java/com/apptemplate/
      const javaDir = path.join(baseDir, 'src', 'main', 'java', 'com', 'apptemplate');
      fs.mkdirSync(javaDir, { recursive: true });
      fs.writeFileSync(
        path.join(javaDir, 'Application.java'),
        'package com.apptemplate;\npublic class Application {}'
      );
      // pom.xml
      fs.writeFileSync(
        path.join(baseDir, 'pom.xml'),
        '<project><artifactId>app-template</artifactId><groupId>com.apptemplate</groupId></project>'
      );
    }

    it('replaces package names in Java files', async () => {
      const backendDir = path.join(tmpDir, 'backend');
      fs.mkdirSync(backendDir, { recursive: true });
      setupSpringProject(backendDir);

      const config = createConfig({
        projectName: 'My.Company',
        backend: 'spring',
        architecture: 'feature',
      });
      await renameProject(tmpDir, config);

      // Java file should have new package name
      const newPkgDir = path.join(backendDir, 'src', 'main', 'java', 'my', 'company');
      expect(fs.existsSync(newPkgDir)).toBe(true);
      const content = fs.readFileSync(path.join(newPkgDir, 'Application.java'), 'utf-8');
      expect(content).toContain('my.company');
      expect(content).not.toContain('com.apptemplate');
    });

    it('updates pom.xml with new artifact and group IDs', async () => {
      const backendDir = path.join(tmpDir, 'backend');
      fs.mkdirSync(backendDir, { recursive: true });
      setupSpringProject(backendDir);

      const config = createConfig({
        projectName: 'My.Company',
        backend: 'spring',
        architecture: 'feature',
      });
      await renameProject(tmpDir, config);

      const pomContent = fs.readFileSync(path.join(backendDir, 'pom.xml'), 'utf-8');
      expect(pomContent).toContain('my-company');
      expect(pomContent).not.toContain('app-template');
    });
  });
});
