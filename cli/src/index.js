import {Command} from 'commander';
import chalk from 'chalk';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import glob from 'fast-glob';

const program = new Command();

program
    .name('minty')
    .description('Minty CLI tool for codebase indexing')
    .version('0.1.0');

// Simple heuristic to check if file is binary
async function isBinaryFile(filepath) {
    try {
        const handle = await fs.open(filepath, 'r');
        const buffer = Buffer.alloc(4096);
        const {bytesRead} = await handle.read(buffer, 0, 4096, 0);
        await handle.close();

        // Check for null bytes
        for (let i = 0; i < bytesRead; i++) {
            if (buffer[i] === 0) {
                return true;
            }
        }
        return false;
    } catch (error) {
        return false; // dynamic files or access errors
    }
}

program
    .command('index')
    .description('Index the current directory')
    .argument('[directory]', 'Directory to index', '.')
    .option('--full', 'Include full file content in .minty file', true) // Default true for agents
    .action(async (directory, options) => {
        try {
            const targetDir = path.resolve(process.cwd(), directory);
            console.log(chalk.blue(`Indexing directory: ${targetDir}`));

            try {
                const stats = await fs.stat(targetDir);
                if (!stats.isDirectory()) {
                    console.error(chalk.red('Error: Target path is not a directory'));
                    process.exit(1);
                }
            } catch (err) {
                console.error(chalk.red(`Error: Directory not found: ${targetDir}`));
                process.exit(1);
            }

            const mintyFilePath = path.join(targetDir, '.minty');
            const markdownFilePath = path.join(targetDir, 'codebase.md');

            let projectId = crypto.randomUUID();
            try {
                const existingContent = await fs.readFile(mintyFilePath, 'utf-8');
                const existingConfig = JSON.parse(existingContent);
                if (existingConfig.projectId) {
                    projectId = existingConfig.projectId;
                }
            } catch (e) {
                // Ignore
            }

            console.log(chalk.gray('Scanning files...'));
            // Using fast-glob which respects .gitignore if we configure it, or we manually check
            // fast-glob doesn't automatically read .gitignore, we'd need another lib or manual config.
            // For now, let's use standard exclude patterns.
            const filePaths = await glob('**/*', {
                cwd: targetDir,
                ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/.minty', '**/codebase.md', '**/package-lock.json', '**/yarn.lock'],
                dot: true,
                onlyFiles: true
            });

            console.log(chalk.green(`Found ${filePaths.length} files. Processing content...`));

            const processedFiles = [];
            let totalTokens = 0;
            let codebaseMarkdown = `# Codebase Dump\n\n`;

            for (const filePath of filePaths) {
                const fullPath = path.join(targetDir, filePath);
                const stats = await fs.stat(fullPath);

                // Skip large files (> 1MB)
                if (stats.size > 1024 * 1024) {
                    console.log(chalk.yellow(`Skipping large file: ${filePath}`));
                    continue;
                }

                if (await isBinaryFile(fullPath)) {
                    console.log(chalk.yellow(`Skipping binary file: ${filePath}`));
                    continue;
                }

                try {
                    const content = await fs.readFile(fullPath, 'utf-8');
                    const tokens = Math.ceil(content.length / 4); // Rough estimation
                    totalTokens += tokens;

                    processedFiles.push({
                        path: filePath,
                        size: stats.size,
                        tokens: tokens,
                        lastModified: stats.mtime.toISOString(),
                        content: content
                    });

                    // Append to markdown
                    codebaseMarkdown += `## File: ${filePath}\n\`\`\`\n${content}\n\`\`\`\n\n`;

                } catch (readErr) {
                    console.error(chalk.red(`Failed to read ${filePath}: ${readErr.message}`));
                }
            }

            const config = {
                version: '1.1.0',
                lastScanned: new Date().toISOString(),
                projectId: projectId,
                totalFiles: processedFiles.length,
                totalTokens: totalTokens,
                files: processedFiles
            };

            // Write .minty (JSON)
            await fs.writeFile(mintyFilePath, JSON.stringify(config, null, 2));

            // Write codebase.md (Markdown for LLM)
            await fs.writeFile(markdownFilePath, codebaseMarkdown);

            console.log(chalk.green('Indexing complete!'));
            console.log(chalk.white(`- .minty (JSON Data): ${mintyFilePath}`));
            console.log(chalk.white(`- codebase.md (LLM Context): ${markdownFilePath}`));
            console.log(chalk.cyan(`Total Tokens (Est): ${totalTokens}`));

        } catch (error) {
            console.error(chalk.red('Error indexing directory:'), error.message);
            process.exit(1);
        }
    });

program.parse();
