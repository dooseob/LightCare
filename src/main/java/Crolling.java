import java.io.*;
import java.util.*;

public class Crolling {
    public static void main(String[] args) {
        // 탐색할 최상위 폴더 경로
        String rootDirectory = "D:\\cch\\project_2\\LightCare\\src\\main"; // 경로 구분자 수정 (슬래시로 변경)

        // 결과를 저장할 파일 경로
        String outputFilePath = "D:/LightCare.txt"; // 경로 구분자 수정 (슬래시로 변경)

        // 출력 파일 준비
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(outputFilePath))) {
            // 폴더 내 모든 .java, .jsp 파일 크롤링
            List<File> files = getAllJavaJspFiles(rootDirectory);
            
            // 각 파일을 읽어 결과 파일에 작성
            for (File file : files) {
                System.out.println("파일 읽기: " + file.getAbsolutePath());
                writeFileContentToFile(file, writer);
            }
            System.out.println("모든 파일을 크롤링하여 " + outputFilePath + "에 저장했습니다.");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // 모든 .java, .jsp 파일을 재귀적으로 찾는 함수
    public static List<File> getAllJavaJspFiles(String directoryPath) {
        List<File> javaJspFiles = new ArrayList<>();
        File rootDirectory = new File(directoryPath);

        // 지정된 디렉토리 내 모든 파일 및 폴더 처리
        File[] files = rootDirectory.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    // 서브디렉토리가 있으면 재귀적으로 검색
                    javaJspFiles.addAll(getAllJavaJspFiles(file.getAbsolutePath()));
                } else if (file.getName().endsWith(".java") || file.getName().endsWith(".jsp")) {
                    // .java 또는 .jsp 파일이면 리스트에 추가
                    javaJspFiles.add(file);
                }
            }
        }
        return javaJspFiles;
    }

    // 파일의 내용을 결과 파일에 추가하는 함수
    public static void writeFileContentToFile(File file, BufferedWriter writer) throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            writer.write("파일명: " + file.getName() + "\n");
            writer.write("경로: " + file.getAbsolutePath() + "\n");
            writer.write("----------------------------------------------------\n");

            // 파일 내용 읽기
            while ((line = reader.readLine()) != null) {
                writer.write(line + "\n");
            }

            writer.write("\n\n"); // 파일 간 구분
        }
    }
}
