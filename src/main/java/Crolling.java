import java.io.*;
import java.util.*;

public class Crolling {
    public static void main(String[] args) {
        String rootDirectory = "D:\\cch\\project_2\\LightCare\\src\\main";

        String outputFilePath = "D:/LightCare.txt";

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(outputFilePath))) {
            List<File> files = getAllFilesWithExtensions(rootDirectory, Arrays.asList(".java", ".jsp", ".xml", ".js", ".html", ".css"));
            
            for (File file : files) {
                System.out.println("파일 읽기: " + file.getAbsolutePath());
                writeFileContentToFile(file, writer);
            }
            System.out.println("모든 파일을 크롤링하여 " + outputFilePath + "에 저장했습니다.");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // 여러 확장자를 포함하는 파일들을 재귀적으로 찾는 함수
    public static List<File> getAllFilesWithExtensions(String directoryPath, List<String> extensions) {
        List<File> matchedFiles = new ArrayList<>();
        File rootDirectory = new File(directoryPath);

        File[] files = rootDirectory.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    matchedFiles.addAll(getAllFilesWithExtensions(file.getAbsolutePath(), extensions));
                } else {
                    for (String ext : extensions) {
                        if (file.getName().toLowerCase().endsWith(ext)) {
                            matchedFiles.add(file);
                            break;  // 한번 매칭되면 다음 파일로 넘어감
                        }
                    }
                }
            }
        }
        return matchedFiles;
    }

    public static void writeFileContentToFile(File file, BufferedWriter writer) throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            writer.write("파일명: " + file.getName() + "\n");
            writer.write("경로: " + file.getAbsolutePath() + "\n");
            writer.write("----------------------------------------------------\n");

            String line;
            while ((line = reader.readLine()) != null) {
                writer.write(line + "\n");
            }

            writer.write("\n\n");
        }
    }
}
